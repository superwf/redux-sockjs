import EventEmitter from 'events'

// multiple channel for single connection
class Channel extends EventEmitter {
  /*
   * @param Object instance of server/eventEmitter
   * @param String identity, channel name
   * */
  constructor(emitter, identity) {
    super()
    this.emitter = emitter
    this.identity = identity
    this.ondata = this.ondata.bind(this)
    this.onclose = this.onclose.bind(this)
    emitter.on('data', this.ondata)
    emitter.on('close', this.onclose)
  }

  ondata(data) {
    if (data.type === 'channel' && data.channel === this.identity) {
      super.emit('data', data)
    }
  }

  onclose() {
    this.destroy()
  }

  emit(data) {
    this.emitter.emit({ type: 'channel', channel: this.identity, data })
  }

  // clear all listeners, free memory
  destroy() {
    this.removeAllListeners()
    this.emitter.removeListener('data', this.ondata)
    this.emitter.removeListener('close', this.onclose)
  }
}

export default Channel
