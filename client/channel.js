import EventEmitter from 'events'
import { makeEmitter } from './eventEmitter'

// multiple channel for single connection
class Channel extends EventEmitter {
  /*
   * @param Object instance of client/eventEmitter
   * @param String identity, channel name
   * */
  constructor(socket, identity) {
    super()
    this.socket = socket
    this.identity = identity
    this.onopen = this.onopen.bind(this)
    const emitter = makeEmitter(this.socket)
    this.emitter = emitter
    emitter.on('open', () => {
      super.emit('open')
      this.onopen()
    })
  }

  onopen() {
    this.ondata = this.ondata.bind(this)
    this.onclose = this.onclose.bind(this)
    this.emitter.on('data', this.ondata)
    this.emitter.on('close', this.onclose)
  }

  ondata(data) {
    if (data.type === 'channel' && data.channel === this.identity) {
      super.emit('data', data)
    }
    return null
  }

  _emit(...args) {
    return super.emit(...args)
  }

  onclose() {
    return this.destroy()
  }

 /* emit with channel by this.emitter to server
  */
  emit(data) {
    return this.emitter.emit({ type: 'channel', channel: this.identity, data })
  }

  // clear all listeners, free memory
  destroy() {
    this.removeAllListeners()
    if (this.emitter) {
      this.emitter.removeListener('open', this.onopen)
      this.emitter.removeListener('data', this.ondata)
      this.emitter.removeListener('close', this.onclose)
    }
    return null
  }
}

export default Channel
