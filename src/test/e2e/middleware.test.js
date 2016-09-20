import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxPromise from 'redux-promise'
import { startReduxServer } from '../../../server'
import { startReduxClient } from '../../../client'
import actionCreator from '../../client/actionCreator'
import reduxSockjs from '../../client/reduxSockjs'
import defaultHttpServer from '../../server/defaultHttpServer'
// import warn from '../../lib/warn'

describe('middle ware', function testMiddleware() {
  this.slow(1000)
  it('test middleware sync action', async () => {
    const httpServer = defaultHttpServer()
    const port = 10001
    const reduxServer = startReduxServer({
      port,
      server: httpServer,
    })
    const reduxClient = startReduxClient({
      port,
    })

    const userReducerOnClient = (state = [], action) => {
      if (action.type === 'INITIAL_STATE') {
        return action.payload
      }
      if (action.type === 'ADD_USER') {
        return [...state, action.payload]
      }
      return state
    }

    const create = actionCreator(reduxClient)
    const createUser = create('ADD_USER', true)

    const clientStore = createStore(combineReducers({
      user: userReducerOnClient,
    }), applyMiddleware(reduxPromise, reduxSockjs))

    const addUserOnServer = async (action) => {
      /* pretend insert user to db and get new user with id */
      const payload = await Promise.resolve({ ...action.payload, id: 1 })
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
    reduxServer.receive(async (action) => {
      // warn(action)
      const data = await userReducerOnServer(action)
      reduxServer.broadcast(data)
    })

    await new Promise(resolve => {
      reduxClient.on('open', resolve)
    })
    await clientStore.dispatch(createUser({ name: 'xxx' }))

    /* create another client connect from sockjs */
    const anotherClient = startReduxClient({ port })
    await new Promise(resolve => {
      anotherClient.on('open', resolve)
    })
    anotherClient.send({
      type: 'ADD_USER',
      payload: { name: 'another user' },
    })

    const anotherClient1 = startReduxClient({ port })
    await new Promise(resolve => {
      anotherClient1.on('open', resolve)
    })
    anotherClient1.send({
      type: 'ADD_USER',
      payload: { name: 'another user 1' },
    })

    /* wait until last action is received */
    await new Promise(resolve => {
      reduxClient.receive(action => {
        if (action.payload.name === 'another user 1') {
          resolve()
        }
      })
    })

    const stateUser = clientStore.getState().user
    expect(stateUser.length).toBe(3)
    expect(stateUser).toInclude({ name: 'xxx', id: 1 })
    expect(stateUser).toInclude({ name: 'another user', id: 1 })
    expect(stateUser).toInclude({ name: 'another user 1', id: 1 })
    reduxServer.emitter.connection.close()
    httpServer.close()
  })

  it('test middleware async action', async () => {
    const httpServer = defaultHttpServer()
    const param = { port: 10000, server: httpServer }
    const reduxServer = startReduxServer(param)
    const reduxClient = startReduxClient(param)

    const userReducerOnClient = (state = [], action) => {
      // warn(action)
      if (action.type === 'INITIAL_STATE') {
        return action.payload
      }
      if (action.type === 'ADD_USER') {
        return [...state, action.payload]
      }
      return state
    }

    const create = actionCreator(reduxClient)
    const createUser = create('ADD_USER')

    const clientStore = createStore(combineReducers({
      user: userReducerOnClient,
    }), applyMiddleware(reduxPromise, reduxSockjs))

    const addUserOnServer = async (action) => {
      /* pretend insert user to db and get new user with id */
      const payload = await Promise.resolve({ ...action.payload, id: 1 })
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
    reduxServer.receive(async (action) => {
      // warn(action)
      const data = await userReducerOnServer(action)
      reduxServer.broadcast(data)
    })

    await new Promise(resolve => {
      reduxClient.on('open', resolve)
    })
    await clientStore.dispatch(createUser({ name: 'xxx' }))

    /* create another client connect from sockjs */
    const anotherClient = startReduxClient(param)
    await new Promise(resolve => {
      anotherClient.on('open', resolve)
    })
    anotherClient.send({
      type: 'ADD_USER',
      payload: { name: 'another user' },
    })

    const anotherClient1 = startReduxClient(param)
    await new Promise(resolve => {
      anotherClient1.on('open', resolve)
    })
    anotherClient1.send({
      type: 'ADD_USER',
      payload: { name: 'another user 1' },
    })

    // await global.sleep(10)
    /* wait until last action is received */
    await new Promise(resolve => {
      reduxClient.receive(action => {
        if (action.payload.name === 'another user 1') {
          resolve()
        }
      })
    })

    const stateUser = clientStore.getState().user
    expect(stateUser.length).toBe(3)
    expect(stateUser).toInclude({ name: 'xxx', id: 1 })
    expect(stateUser).toInclude({ name: 'another user', id: 1 })
    expect(stateUser).toInclude({ name: 'another user 1', id: 1 })
    reduxServer.emitter.connection.close()
    httpServer.close()
  })
})
