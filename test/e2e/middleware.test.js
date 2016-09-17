import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxPromise from 'redux-promise'
import { startReduxServer, startReduxClient } from '../../index'
// import isAction from '../../lib/isAction'
import createAction from '../../client/createAction'
import reduxSockjs from '../../client/middleware'
import warn from '../../lib/warn'

describe.only('middle ware', () => {
  it('use createAction, createReducer, middleware', async () => {
    const { channel: reduxServer, httpServer } = startReduxServer()
    const reduxClient = startReduxClient()

    const Types = {
      ADD_USER: 'ADD_USER',
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
    }), applyMiddleware(reduxPromise, reduxSockjs))

    const create = createAction(reduxClient)
    const createUser = create('ADD_USER')

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
        await clientStore.dispatch(createUser({ name: 'xxx' }))
        resolve()
      })
    })

    warn(clientStore.getState().user)
    reduxServer.emitter.connection.close()
    httpServer.close()
  })
})
