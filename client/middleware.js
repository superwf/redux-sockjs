import { ActionTypes } from './createAction'

/* for action from other sockjs connection */
const middleware = actionEmitter => ({ dispatch }) => {
  actionEmitter.on(ActionTypes.SOCKJS, action => {
    dispatch(action)
  })
  return next => action => next(action)
}

export default middleware
