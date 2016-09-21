import http from 'http'
import { createStore, combineReducers } from 'redux'
import reduxPromise from 'redux-promise'
import { isFSA } from 'flux-stardard-action'
import { startReduxServer, createReducer, applyMiddleware } from '../../server'

function isPromise(promise) {
  return promise && promise.then && typeof promise.then === 'function'
}

const server = http.createServer()

const reduxChannel = startReduxServer({
  server,
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})

const actions = {
  ADD_TODO: action => {
  }
}

const reducer = createReducer({
  ADD_TODO: (state, action) => [...state, action.payload],
}, [])

const store = createStore(combineReducers({
  todos: reducer,
}), applyMiddleware(reduxPromise))

const broadcast = reduxChannel.broadcast.bind(this)
reduxChannel.receive(action => {
  const result = store.dispatch(actions[action.type](action))
  if (isFSA(result)) {
    broadcast(result)
  }
  if (isPromise(result)) {
    result.then(broadcast)
  }
})
