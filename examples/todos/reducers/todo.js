import remove from 'lodash/remove'
import { createReducer } from 'redux-sockjs'
import { create, list, destroy } from '../actions/todo'

export default createReducer({
  [create]: (state, action) => [...state, action.payload],
  [list]: (state, action) => action.payload,
  [destroy]: (state, action) => {
    const newState = [...state]
    remove(newState, todo => todo.id === action.payload.id)
    return newState
  },
}, [])
