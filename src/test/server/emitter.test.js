import stream from 'stream'
import Emitter from '../../server/emitter'

describe('server/emitter', () => {
  describe('with auto connection', () => {
    let emitter
    const conn = new stream.Transform()
    conn.close = () => {}
    conn.write = () => {}
    const socket = new stream.Transform()

    beforeEach(() => {
      emitter = new Emitter(socket)
      socket.emit('connection', conn)
    })

    afterEach(() => {
      conn.emit('close')
      emitter.destroy()
    })

    it('max listener is 100', () => {
      const number = emitter.getMaxListeners()
      expect(number).toBe(100)
    })

    it('on parse data', done => {
      const data = { sdfas: 3434545 }
      emitter.on('data', d => {
        expect(d).toEqual(data)
        done()
      })
      conn.emit('data', JSON.stringify(data))
    })

    it('on parse none json data, warn it', () => {
      const spy = expect.spyOn(console, 'warn')
      conn.emit('data', 'xxxxxxx')
      expect(spy).toHaveBeenCalled()
      spy.restore()
    })

    it('send/on parse json', () => {
      const data = { sdfas: 3434545 }
      const spy = expect.spyOn(conn, 'write')
      emitter.send(data)
      expect(spy).toHaveBeenCalledWith(JSON.stringify(data))
      spy.restore()
    })

    it('conn emit close', () => {
      expect(emitter.connection.listeners('data').length > 0).toBe(true)

      emitter.connection.emit('close')

      expect(emitter.connection.listeners('data').length === 0).toBe(true)
    })

    it('destroy', () => {
      emitter.on('close', () => {})
      expect(emitter.listeners('close').length > 0).toBe(true)
      emitter.destroy()
      expect(emitter.listeners('close').length === 0).toBe(true)
    })
  })


  it('broadcast to multiple connection', done => {
    const socket = new stream.Transform()
    const conn1 = new stream.Transform()
    conn1.close = () => {}
    conn1.write = () => {}
    const conn2 = new stream.Transform()
    conn2.close = () => {}
    conn2.write = () => {}

    const emitter = new Emitter(socket)
    socket.emit('connection', conn1)
    socket.emit('connection', conn2)
    const spy1 = expect.spyOn(conn1, 'write')
    const spy2 = expect.spyOn(conn2, 'write')

    const data = {
      type: 'channel',
      data: {
        type: 'abc',
      },
    }
    emitter.broadcast(data)
    expect(spy1.calls.length).toBe(1)
    expect(spy2.calls.length).toBe(1)
    expect(spy1).toHaveBeenCalledWith(JSON.stringify(data))
    expect(spy2).toHaveBeenCalledWith(JSON.stringify(data))

    emitter.broadcast(data)
    expect(spy1.calls.length).toBe(2)
    expect(spy2.calls.length).toBe(2)
    conn1.emit('close')
    conn2.emit('close')
    emitter.destroy()
    done()
  })
})
