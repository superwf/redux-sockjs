import EventEmitter from 'events'

/* all sockjs should dispatch to instance of this class
 * */
class Emitter extends EventEmitter {
  constructor(connection) {
    super()
    this.connection = connection
    super.setMaxListeners(100)
    this.open = false

    this.onmessage = this.onmessage.bind(this)

    this.connection.onopen = () => {
      this.open = true
      super.emit('open')
    }

    this.connection.onmessage = this.onmessage

    this.connection.onclose = () => {
      super.emit('close')
      this.destroy()
    }
  }

  onmessage(evt) {
    const data = JSON.parse(evt.data)
    super.emit('data', data)
  }

  // emit data to socket
  // so no eventName, only data
  emit(data) {
    if (!this.open) {
      throw new Error('connection not open yet')
    }
    this.connection.send(JSON.stringify(data))
  }

  _emit(...args) {
    super.emit(...args)
  }

  destroy() {
    this.removeAllListeners()
    // this.connection.close()
  }
}

export default Emitter

export const makeEmitter = socket => new Emitter(socket)
