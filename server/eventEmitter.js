import EventEmitter from 'events'
import warn from '../lib/warn'

/* all sockjs should dispatch to instance of this class
 * */
class Emitter extends EventEmitter {
  constructor(connection) {
    super()
    this.connection = connection
    super.setMaxListeners(100)
    // Emitter.emitters.push(this)

    connection.on('data', message => {
      try {
        const data = JSON.parse(message)
        super.emit('data', data)
      } catch (e) {
        warn(e)
        warn(`${message} can not parse to json`)
      }
    })

    connection.on('close', () => {
      super.emit('close')
      this.destroy()
    })
  }

  // emit data to connection
  // so no eventName, only data
  emit(data) {
    this.connection.write(JSON.stringify(data))
  }

  _emit(...args) {
    super.emit(...args)
  }

  destroy(close = false) {
    this.removeAllListeners()
    this.connection.removeAllListeners()
    if (close) {
      this.connection.close()
    }
    // Emitter.removeEmitter(this)
  }
}

// Emitter.emitters = []

// Emitter.removeEmitter = emitter => {
//   const emitters = Emitter.emitters
//   const index = Emitter.emitters.findIndex(value => value === emitter)
//   if (index > -1) {
//     Emitter.emitters = [...emitters.slice(0, index), ...emitters.slice(index + 1)]
//   }
// }

// Emitter.clearEmitters = () => {
//   Emitter.emitters = []
// }

export default Emitter

export const makeEmitter = connection => new Emitter(connection)
