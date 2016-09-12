import Emitter from '../../server/emitter'
import stream from 'stream'

describe('server/emitter', () => {
  let emitter
  const conn = new stream.Transform()
  conn.close = () => {}
  const socket = new stream.Transform()

  beforeEach(() => {
    emitter = new Emitter(socket)
    socket.emit('connection', conn)
  })

  afterEach(() => {
    emitter.destroy()
  })

  it('max listener is 100', () => {
    const number = emitter.getMaxListeners()
    expect(number).toBe(100)
  })

  it('on parse error json data', () => {
    const data = 'xxxxxx'
    conn.emit('data', JSON.stringify(data))
    expect(() => {
      conn.emit('data', data)
    }).toThrow()
  })

  it('on parse data', done => {
    const data = {sdfas: 3434545}
    emitter.on('data', d => {
      expect(d).toEqual(data)
      done()
    })
    conn.emit('data', JSON.stringify(data))
  })

  it('send/on parse json', () => {
    const data = {sdfas: 3434545}
    const spy = expect.spyOn(conn, 'write')
    emitter.send(data)
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
