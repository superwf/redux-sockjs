import uuid from 'uuid'
// import EventEmitter from 'events'
import isAction from '../lib/isAction'
import generate from '../lib/reduxChannel'
import Channel from './channel'

const ReduxChannel = generate(Channel)
class ReduxClientChannel extends ReduxChannel {
  /* create action to be used both on send payload to server and receive from server */
  createAction(type) {
    return payload => {
      if (isAction(payload)) {
        return payload
      }
      return new Promise((resolve, reject) => {
        const token = uuid()
        const eventName = `${type}${token}`
        this.send({
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
          this.removeListener(eventName, resolver)
        }, 1000)
        this.once(eventName, resolver)
      })
    }
  }
}

export default ReduxClientChannel
