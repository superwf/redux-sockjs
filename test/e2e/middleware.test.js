import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxPromise from 'redux-promise'
import { startReduxServer, startReduxClient } from '../../index'
// import isAction from '../../lib/isAction'
import createAction from '../../client/createAction'
import reduxSockjs from '../../client/middleware'
// import warn from '../../lib/warn'

describe.only('middle ware', function testMiddleware() {
  this.slow(1000)
  it('test middleware sync action', async () => {
    const { channel: reduxServer, httpServer } = startReduxServer()
    const reduxClient = startReduxClient()

    const userReducerOnClient = (state = [], action) => {
      if (action.type === 'INITIAL_STATE') {
        return action.payload
      }
      if (action.type === 'ADD_USER') {
        return [...state, action.payload]
      }
      return state
    }

    const [create, actionEmitter] = createAction(reduxClient)
    const createUser = create('ADD_USER')

    const clientStore = createStore(combineReducers({
      user: userReducerOnClient,
    }), applyMiddleware(reduxPromise, reduxSockjs(actionEmitter)))

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
    const anotherClient = startReduxClient()
    await new Promise(resolve => {
      anotherClient.on('open', resolve)
    })
    anotherClient.send({
      type: 'ADD_USER',
      payload: { name: 'another user' },
    })

    const anotherClient1 = startReduxClient()
    await new Promise(resolve => {
      anotherClient1.on('open', resolve)
    })
    anotherClient1.send({
      type: 'ADD_USER',
      payload: { name: 'another user 1' },
    })

    await global.sleep(10)

    const stateUser = clientStore.getState().user
    expect(stateUser.length).toBe(3)
    expect(stateUser).toInclude({ name: 'xxx', id: 1 })
    expect(stateUser).toInclude({ name: 'another user', id: 1 })
    expect(stateUser).toInclude({ name: 'another user 1', id: 1 })
    reduxServer.emitter.connection.close()
    httpServer.close()
  })

  it('test middleware async action', async () => {
    const param = { port: 10000 }
    const { channel: reduxServer, httpServer } = startReduxServer(param)
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

    const [create, actionEmitter] = createAction(reduxClient)
    const createUser = create('ADD_USER', false)

    const clientStore = createStore(combineReducers({
      user: userReducerOnClient,
    }), applyMiddleware(reduxPromise, reduxSockjs(actionEmitter)))

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

    await global.sleep(10)

    const stateUser = clientStore.getState().user
    expect(stateUser.length).toBe(3)
    expect(stateUser).toInclude({ name: 'xxx', id: 1 })
    expect(stateUser).toInclude({ name: 'another user', id: 1 })
    expect(stateUser).toInclude({ name: 'another user 1', id: 1 })
    reduxServer.emitter.connection.close()
    httpServer.close()
  })
})
