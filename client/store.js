import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxPromise from 'redux-promise'
import identity from 'lodash/identity'
import reducer from './reducer'
import initialState from '../lib/initialState'

const store = createStore(
  combineReducers({ task: reducer }),
  applyMiddleware(reduxPromise),
  global.devToolsExtension ? global.devToolsExtension() : identity
)

export default store
