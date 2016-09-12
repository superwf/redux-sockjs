import EventEmitter from 'events'

/* all sockjs should dispatch to instance of this class
 * */
class Emitter extends EventEmitter {
  constructor(connection) {
    super()
    this.connection = connection
    this.setMaxListeners(100)
    this.open = false

    this.onmessage = this.onmessage.bind(this)

    this.connection.onopen = () => {
      // this.open = true
      this.emit('open')
    }

    this.connection.onmessage = this.onmessage

    this.connection.onclose = () => {
      this.emit('close')
      this.destroy()
    }
  }

  onmessage(evt) {
    const data = JSON.parse(evt.data)
    this.emit('data', data)
  }

  // send data to socket
  // so no eventName, only data
  send(data) {
    // if (!this.open) {
    //   throw new Error('connection not open yet, try send in later code')
    // }
    this.connection.send(JSON.stringify(data))
  }

  destroy() {
    this.removeAllListeners()
  }
}

export default Emitter
