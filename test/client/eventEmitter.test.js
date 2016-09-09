import Emitter from '../../client/eventEmitter'
import EventEmitter from 'events'
import noop from 'lodash/noop'

describe('client/eventEmitter', () => {

  let emitter, socket
  beforeEach(() => {
    socket = new EventEmitter()
    socket.send = noop
    socket.close = () => {
      socket.onclose()
    }
    emitter = new Emitter(socket)
  })

  it('maxListeners is 100, has open property, has connection property', () => {
    expect(emitter.getMaxListeners()).toBe(100)
    expect(emitter.open).toBe(false)
    const onopen = expect.createSpy()
    emitter.on('open', onopen)
    socket.onopen()
    expect(onopen).toHaveBeenCalled()
    expect(emitter.connection).toBe(socket)
    expect(emitter.open).toBe(true)
  })

  it('emit', () => {
    const spy = expect.spyOn(emitter.connection, 'send')
    const data = {xxx: 'sfdsdfdsf'}
    expect(() => {
      emitter.emit(data)
    }).toThrow()

    emitter.connection.onopen()
    emitter.emit(data)
    expect(spy).toHaveBeenCalledWith(JSON.stringify(data))
  })

  it('onmessage', done => {
    const data = {xxx: 'sdfsfd'}
    const evt = {
      data: JSON.stringify(data)
    }
    emitter.on('data', msg => {
      expect(msg).toEqual(data)
      done()
    })
    socket.onmessage(evt)
  })

  it('socket.onclose and emitter.destroy', done => {
    emitter.on('close', () => {
      done()
    })
    socket.close()
    expect(socket.listeners()).toEqual([])
    expect(emitter.listeners()).toEqual([])
  })

  it('_emit invoke super.emit', done => {
    const evtName = 'a random evt'
    const data = {sdfsdf: 121323}
    emitter.on(evtName, msg => {
      expect(msg).toBe(data)
      done()
    })
    emitter._emit(evtName, data)
  })
})
