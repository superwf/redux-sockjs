import findIndex from 'lodash/findIndex'
import EventEmitter from 'events'
import warn from '../lib/warn'

/* all sockjs should dispatch to instance of this class
 * */
const connections = []

class Emitter extends EventEmitter {
  constructor(socket) {
    super()
    this.socket = socket
    this.setMaxListeners(100)

    this.onconnection = this.onconnection.bind(this)
    socket.on('connection', this.onconnection)
    // console.log(socket.listeners('connection').length)
  }

  onconnection(connection) {
    connections.push(connection)
    // console.log(connections.length)
    this.connection = connection
    this.ondata = this.ondata.bind(this)
    connection.on('data', this.ondata)

    connection.on('close', () => {
      // this.emit('close')
      connection.removeAllListeners()
      connection.close()
      const index = findIndex(connections, connection)
      connections.splice(index, 1)
    })
    this.emit('open')
    // console.log('server emitter open')
  }

  ondata(message) {
    // console.log(message)
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
    // console.log(data)
    this.connection.write(JSON.stringify(data))
  }

  broadcast(data, includeSelf = true) {
    // console.log('broadcast', data)
    connections.forEach(connection => {
      if (!includeSelf && this.connection === connection) {
        return
      }
      connection.write(JSON.stringify(data))
    })
  }

  destroy() {
    this.removeAllListeners()
  }
}

Emitter.connections = connections

export default Emitter
