import { createStore, combineReducers, applyMiddleware } from 'redux'
import EventEmitter from 'events'
import reduxPromise from 'redux-promise'
import uuid from 'uuid'
import { startReduxServer, startReduxClient } from '../../index'
import isAction from '../../lib/isAction'
import defaultHttpServer from '../../server/defaultHttpServer'
// import Emitter from '../../server/emitter'
// import warn from '../../lib/warn'

describe('real world', () => {
  it('browser receive initial state from server', async () => {
    const httpServer = defaultHttpServer()
    const reduxServer = startReduxServer({
      server: httpServer,
    })
    const emitter = new EventEmitter()
    const reduxClient = startReduxClient()

    const timeoutInterval = 1000
    /* browser side redux action, reducer, store */
    const addUserOnClient = user => {
      if (isAction(user)) {
        return user
      }
      return new Promise((resolve, reject) => {
        const token = uuid()
        const type = 'ADD_USER'
        const eventName = `${type}-${token}`
        reduxClient.send({
          type,
          payload: user,
          token,
        })

        let timeout = 0
        const resolver = createdUser => {
          resolve(createdUser)
          clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
          reject(`${type} token ${token} failed because timeout`)
          emitter.removeListener(eventName, resolver)
        }, timeoutInterval)
        emitter.once(eventName, resolver)
      })
    }

    const userReducerOnClient = (state = [], action) => {
      if (action.type === 'INITIAL_STATE') {
        return action.payload
      }
      if (action.type === 'ADD_USER') {
        return [...state, action.payload]
      }
      return state
    }

    const clientStore = createStore(combineReducers({
      user: userReducerOnClient,
    }), applyMiddleware(reduxPromise))

    emitter.on('ADD_USER', user => {
      // warn('emititer on ADD_USER', user)
      clientStore.dispatch(addUserOnClient(user))
    })

    reduxClient.receive(action => {
      // warn('reduxClient receive', action)
      const eventName = `${action.type}-${action.token}`
      if (emitter.listeners(eventName).length) {
        emitter.emit(eventName, action)
      } else {
        /* for other user from other connection pub action */
        emitter.emit(action.type, action)
      }
    })

    /* server side */
    const addUserOnServer = action => {
      /* pretend insert user to db and get new user with id */
      const payload = (user => ({ ...user, id: 1 }))(action.payload)
      return { ...action, payload }
    }

    const userReducerOnServer = action => {
      switch (action.type) {
        case 'INITIAL_STATE':
          return []
        case 'ADD_USER':
          return addUserOnServer(action)
        default:
          return []
      }
    }

    reduxServer.receive(action => {
      reduxServer.broadcast(userReducerOnServer(action))
    })

    await new Promise(resolve => {
      reduxClient.on('open', async () => {
        await clientStore.dispatch(addUserOnClient({ name: 'from browser 0' }))
        resolve()
      })
    })


    expect(clientStore.getState().user).toEqual([{ name: 'from browser 0', id: 1 }])


    /* another client connect this channel */
    const reduxClient1 = startReduxClient()
    // warn(reduxServer.socket.listeners('connection').length)
    const token1 = uuid()
    reduxClient1.on('open', () => {
      reduxClient1.send({
        type: 'ADD_USER',
        payload: { name: 'another user' },
        token: token1,
      })
    })

    await new Promise(resolve => {
      emitter.once(`ADD_USER-${token1}`, user => {
        clientStore.dispatch(addUserOnClient(user))
        resolve()
      })
    })

    const reduxClient2 = startReduxClient()
    const token2 = uuid()
    reduxClient2.on('open', () => {
      reduxClient2.send({
        type: 'ADD_USER',
        payload: { name: 'another user from reduxClient2' },
        token: token2,
      })
    })

    await new Promise(resolve => {
      emitter.once(`ADD_USER-${token2}`, user => {
        clientStore.dispatch(addUserOnClient(user))
        resolve()
      })
    })

    // console.log(Emitter.connections.length)
    // console.log(Emitter.connections[0] === reduxServer.emitter.connection)
    // await global.sleep(100)
    // console.log(Emitter.connections.length)

    expect(clientStore.getState().user)

    reduxServer.emitter.connection.close()
    httpServer.close()
  })
})
