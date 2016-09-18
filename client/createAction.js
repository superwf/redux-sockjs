import uuid from 'uuid'
import EventEmitter from 'events'

const ActionTypes = {
  SOCKJS: '@@redux-sockjs',
  NOOP_ACTION: '@@redux-sockjs-noop',
}


/**
 * @param {ReduxChannel} ReduxChannel instance
 * @param {Number} timeoutInterval, unit milisecond
 * @return {Function} action creator that bound to reduxChannel
 */
const createAction = (reduxChannel, timeoutInterval = 1000) => {
  const actionEmitter = new EventEmitter()
  actionEmitter.setMaxListeners(100)
  const ondataFunc = action => {
    const { token } = action
    if (token && actionEmitter.listeners(token).length) {
      // console.log('emit SOCKJS ', action)
      actionEmitter.emit(token, action)
    /* for action from other sockjs connection */
    } else {
      actionEmitter.emit(ActionTypes.SOCKJS, action)
    }
  }
  reduxChannel.receive(ondataFunc)
  /* send payload to server
   * sync model will return promise
   * async will return an empty action that should do nothing by redux store
   * */
  return [(type, sync = true) => payload => {
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
    return { type: ActionTypes.NOOP_ACTION }
  }, actionEmitter]
}

export { ActionTypes }

export default createAction
