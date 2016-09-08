import Event from 'events'
// import pull from 'lodash/pull'
// import isPlainObject from 'lodash/isPlainObject'

/* all sockjs should dispatch to instance of this class
 * */
class Emitter extends Event {
  constructor(connection) {
    super()
    this.connection = connection
    super.setMaxListeners(100)
    Emitter.emitters.push(this)

    connection.on('data', message => {
      const data = JSON.parse(message)
      super.emit(data.type, data)
    })

    connection.on('close', () => {
      this.destroy()
      super.emit('close')
    })
  }

  // emit data to connection
  // so no eventName, only data
  emit(data) {
    this.connection.write(JSON.stringify(data))
  }

  destroy() {
    this.removeAllListeners()
    this.connection.removeAllListeners()
    Emitter.removeEmitter(this)
  }
}

Emitter.emitters = []

Emitter.removeEmitter = emitter => {
  const emitters = Emitter.emitters
  const index = Emitter.emitters.findIndex(value => value === emitter)
  if (index > -1) {
    Emitter.emitters = [...emitters.slice(0, index), ...emitters.slice(index + 1)]
  }
}

Emitter.clearEmitters = () => {
  Emitter.emitters = []
}

// Emitter.channels = {}

export default Emitter

export const makeEmitter = connection => new Emitter(connection)
