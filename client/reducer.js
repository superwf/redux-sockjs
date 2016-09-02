import ACTION from '../lib/action'

const assign = Object.assign
const taskReucer = (state, action) => {
  switch (action.type) {
    case ACTION.ADD: {
      const list = state.list.slice()
      return assign({}, state, {
        list: [...list, action.payload],
      })
    }
    default: {
      return state
    }
  }
}


export default taskReucer
