import uuid from 'uuid'
import EventEmitter from 'events'

const actionEmitter = new EventEmitter()
actionEmitter.setMaxListeners(100)
const ActionTypes = {
  SOCKJS: '@@redux-sockjs',
  SKIP_ACTION: '@@redux-sockjs-skip-action',
}

/**
 * @param {ReduxChannel} ReduxChannel instance
 * @param {Number} timeoutInterval, unit milisecond
 * @return {Function} action creator that bound to reduxChannel
 */
const createAction = (reduxChannel, timeoutInterval = 1000) => {
  reduxChannel.receive(action => {
    const { token } = action
    if (token && actionEmitter.listeners(token).length) {
      actionEmitter.emit(token, action)
    /* for action from other sockjs connection */
    } else {
      actionEmitter.emit(ActionTypes.SOCKJS, action)
    }
  })
  /* send payload to server */
  return (type, sync = true) => payload => {
    if (sync) {
      return new Promise((resolve, reject) => {
        const token = uuid()
        reduxChannel.send({
          type,
          payload,
          token,
        })
        let timer = 0
        const resolver = action => {
          resolve(action)
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          actionEmitter.removeListener(token, resolver)
          reject(`type: ${type}, token: ${token}, payload: ${payload} failed because timeout more than ${timeoutInterval}`)
        }, timeoutInterval)
        actionEmitter.once(token, resolver)
      })
    }
    reduxChannel.send({
      type,
      payload,
    })
    return { type: ActionTypes.SKIP_ACTION }
  }
}

export { actionEmitter, ActionTypes }

export default createAction
