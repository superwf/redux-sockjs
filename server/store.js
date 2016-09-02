import { createStore, combineReducers } from 'redux'
import reducer from '../server/reducer'

const store = createStore(combineReducers({ task: reducer }))

export default store
