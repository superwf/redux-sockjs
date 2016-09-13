import identity from 'lodash/identity'
import EventEmitter from 'events'

// multiple channel for single connection
export default Emitter => class Channel extends EventEmitter {
  /*
   * @param Object instance of server/eventEmitter
   * @param String channelName, channel name
   * */
  constructor(socket, channelName) {
    if (!channelName) {
      throw new Error('channel must has an identity')
    }
    super()
    this.socket = socket
    this.channelName = channelName
    this._receiveFunc = identity
    this.onopen = this.onopen.bind(this)
    const emitter = new Emitter(socket)
    this.emitter = emitter
    emitter.on('open', this.onopen)
  }

  onopen() {
    this.ondata = this.ondata.bind(this)
    this.onclose = this.onclose.bind(this)
    this.emitter.on('data', this.ondata)
    this.emitter.on('close', this.onclose)
    this.emit('open')
  }

  receive(func) {
    this._receiveFunc = func
  }

  ondata(data) {
    if (data && data.type === 'channel' && data.channel === this.channelName) {
      this._receiveFunc(data.data)
    }
    return null
  }

  onclose() {
    return this.destroy()
  }

 /* send with channel by this.emitter to browser
  */
  send(data) {
    return this.emitter.send({ type: 'channel', channel: this.channelName, data })
  }

  // clear all listeners, free memory
  destroy() {
    this.removeAllListeners()
    this._receiveFunc = identity
    const { emitter } = this
    emitter.removeListener('open', this.onopen)
    emitter.removeListener('data', this.ondata)
    emitter.removeListener('close', this.onclose)
    return null
  }
}
