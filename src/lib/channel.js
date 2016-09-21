import EventEmitter from 'events'

/* multiple channel for single connection */
export default Emitter => class Channel extends EventEmitter {
  /*
   * @param Object instance of server/eventEmitter
   * @param String channelName, channel name
   * */
  constructor(socket, channelName) {
    if (!channelName) {
      throw new Error('channel must has an channelName')
    }
    super()
    this.socket = socket
    this.channelName = channelName
    this._ondataFuncs = new Map()
    const emitter = new Emitter(socket)
    this.emitter = emitter
    this.onopen = this.onopen.bind(this)
    this.ondata = this.ondata.bind(this)
    this.onclose = this.onclose.bind(this)
    emitter.on('open', this.onopen)
    emitter.on('data', this.ondata)
    emitter.on('close', this.onclose)
  }

  onopen() {
    this.emit('open')
  }

  /* add func that will invoke when ondata */
  receive(func) {
    this._ondataFuncs.set(func, func.bind(this))
  }

  /* remove func that will invoke when ondata */
  remove(func) {
    this._ondataFuncs.delete(func)
  }

  ondata(data) {
    if (data && data.type === 'channel' && data.channel === this.channelName) {
      this._ondataFuncs.forEach(func => func(data.data))
    }
  }

  onclose() {
    this.emit('close')
  }

 /* send with channel by this.emitter to browser
  */
  send(data) {
    this.emitter.send({ type: 'channel', channel: this.channelName, data })
  }

  /* clear all listeners, free memory */
  destroy() {
    this.removeAllListeners()
  }
}
