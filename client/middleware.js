import { actionEmitter, ActionTypes } from './createAction'

/* for action from other sockjs connection */
const middleware = ({ dispatch }) => {
  actionEmitter.on(ActionTypes.SOCKJS, action => {
    dispatch(action)
  })
  return next => action => next(action)
}

export default middleware
