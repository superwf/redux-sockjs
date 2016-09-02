import ACTION from '../lib/action'
import initialState from '../lib/initialState'

const taskReucer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION.ADD: {
      const data = {
        // make db insert
        list: [...state.list.list, action.payload],
      }
      return { ...state, ...data }
    }
    default: {
      return state
    }
  }
}


export default taskReucer
