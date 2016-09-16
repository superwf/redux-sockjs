import uuid from 'uuid'
import EventEmitter from 'events'
import isAction from '../lib/isAction'

const createAction = (reduxChannel, timeoutInterval = 1000) => {
  const emitter = new EventEmitter()

  reduxChannel.receive(action => {
    const eventName = `${action.type}${action.token}`
    if (emitter.listeners(eventName).length) {
      emitter.emit(eventName, action)
    } else {
      emitter.emit(action.type, action)
    }
  })

  return type => {
    const actionFunc = payload => {
      /* recevie action from server */
      if (isAction(payload)) {
        return payload
      }
      /* send payload to server */
      return new Promise((resolve, reject) => {
        const token = uuid()
        const eventName = `${type}${token}`
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
          reject(`type: ${type}, token: ${token} failed because timeout`)
          emitter.removeListener(eventName, resolver)
        }, timeoutInterval)
        emitter.once(eventName, resolver)
      })
    }
    return actionFunc
  }
}
// emitter.on(type, action => {
//   store.dispatch(actionFunc(action))
// })

export default createAction
