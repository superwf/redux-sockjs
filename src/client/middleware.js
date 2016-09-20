import { ActionTypes, actionEmitters } from './createAction'

/* for action from other sockjs connection */
const middleware = ({ dispatch }) => {
  const actionEmitter = actionEmitters.shift()
  if (!actionEmitter) {
    throw new Error('need createAction(reduxChannel) first to make an actionEmitter')
  }
  actionEmitter.on(ActionTypes.SOCKJS, action => {
    dispatch(action)
  })
  return next => action => next(action)
}

export default middleware
