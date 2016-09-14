import EventEmitter from 'events'
import warn from '../lib/warn'

/* all sockjs should dispatch to instance of this class
 * */
class Emitter extends EventEmitter {
  constructor(connection) {
    super()
    this.connection = connection
    this.setMaxListeners(100)

    this.onmessage = this.onmessage.bind(this)

    this.connection.onopen = () => {
      this.emit('open')
    }

    this.connection.onmessage = this.onmessage

    this.connection.onclose = () => {
      this.emit('close')
      this.destroy()
    }
  }

  onmessage(evt) {
    try {
      const data = JSON.parse(evt.data)
      this.emit('data', data)
    } catch (e) {
      warn(e)
    }
  }

  // send data to socket
  // no eventName, only data
  send(data) {
    this.connection.send(JSON.stringify(data))
  }

  destroy() {
    this.removeAllListeners()
  }
}

export default Emitter
