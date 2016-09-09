import EventEmitter from '../../server/eventEmitter'
import stream from 'stream'

describe('server/eventEmitter', () => {
  let emitter
  const conn = new stream.Transform()

  beforeEach(() => {
    emitter = new EventEmitter(conn)
  })

  // afterEach(() => {
  //   EventEmitter.clearEmitters()
  // })

  it('max listener is 100', () => {
    const number = emitter.getMaxListeners()
    expect(number).toBe(100)
  })

  // it('EventEmitter.emitters', () => {
  //   EventEmitter.clearEmitters()
  //   expect(EventEmitter.emitters).toEqual([])
  //   const emitter = new EventEmitter(conn)
  //   expect(EventEmitter.emitters).toInclude(emitter)
  //   EventEmitter.removeEmitter(emitter)
  //   expect(EventEmitter.emitters).toNotInclude(emitter)
  //   expect(EventEmitter.emitters).toEqual([])
  // })

  it('emit/on parse json', () => {
    const data = {sdfas: 3434545}
    const spy = expect.spyOn(conn, 'write')
    emitter.emit(data)
    expect(spy).toHaveBeenCalledWith(JSON.stringify(data))
    spy.restore()
  })

  it('close and destroy', done => {
    emitter.on('close', () => {
      done()
    })
    expect(emitter.connection.listeners('data').length > 0).toBe(true)
    expect(emitter.listeners('close').length > 0).toBe(true)
    emitter.connection.emit('close')
    expect(emitter.connection.listeners('data').length === 0).toBe(true)
    expect(emitter.listeners('close').length === 0).toBe(true)
  })
})
