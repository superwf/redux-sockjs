import EventEmitter from 'events'
import warn from '../lib/warn'

/* all sockjs should dispatch to instance of this class
 * */
class Emitter extends EventEmitter {
  constructor(socket) {
    super()
    this.socket = socket
    this.setMaxListeners(100)

    this.onconnection = this.onconnection.bind(this)
    socket.on('connection', this.onconnection)
  }

  onconnection(connection) {
    this.connection = connection
    this.ondata = this.ondata.bind(this)
    connection.on('data', this.ondata)

    connection.on('close', () => {
      this.emit('close')
      this.destroy()
    })
    this.emit('open')
  }

  ondata(message) {
    try {
      const data = JSON.parse(message)
      this.emit('data', data)
    } catch (e) {
      warn(e)
    }
  }

  // emit data to connection
  // no eventName, only data
  send(data) {
    this.connection.write(JSON.stringify(data))
  }

  destroy() {
    this.removeAllListeners()
    if (this.connection) {
      this.connection.removeAllListeners()
      this.connection.close()
    }
  }
}

export default Emitter
