import { createStore, combineReducers } from 'redux'
import ACTION from '../lib/action'
import reducer, { initialState } from '../server/reducer'
// import expect from 'expect'


describe('test action', () => {
  it('action', () => {
    const store = createStore(combineReducers({ task: reducer }))

    let state = store.getState()
    expect(state.task).toEqual(initialState)

    store.dispatch({ type: ACTION.ADD, payload: 123 })
    state = store.getState()
    expect(state.task).toEqual({ list: [123] })
  })
})
