import uuid from 'uuid'
import EventEmitter from 'events'

const ActionTypes = {
  SOCKJS: '@@sockjs',
  NOOP_ACTION: '@@sockjs-noop',
}

const actionEmitters = []


/**
 * @param {ReduxChannel} ReduxChannel instance
 * @param {Number} timeoutInterval, unit milisecond
 * @return {Function} action creator that bound to reduxChannel
 */
const createAction = (reduxChannel, timeoutInterval = 1000) => {
  const actionEmitter = new EventEmitter()
  actionEmitters.push(actionEmitter)
  actionEmitter.setMaxListeners(100)
  const ondataFunc = action => {
    const { token } = action
    if (token && actionEmitter.listeners(token).length) {
      actionEmitter.emit(token, action)
    /* for action from other sockjs connection */
    } else {
      actionEmitter.emit(ActionTypes.SOCKJS, action)
    }
  }
  reduxChannel.receive(ondataFunc)
  /* send payload to server
   * returnPromise model will return promise
   * async will return an empty action that should do nothing by redux store
   * */
  return (type, returnPromise = true) => payload => {
    if (returnPromise) {
      return new Promise((resolve, reject) => {
        const token = uuid.v1()
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
    return { type: ActionTypes.NOOP_ACTION }
  }
}

export { ActionTypes, actionEmitters }

export default createAction
