import { createStore, applyMiddleware, compose } from 'redux'
import reduxPromise from 'redux-promise'
import { reduxSockjs } from '../../client'
import reducer from './reducers'

const store = createStore(reducer, compose(
  applyMiddleware(reduxPromise, reduxSockjs),
  global.devToolsExtension ? global.devToolsExtension() : f => f
))

export default store
