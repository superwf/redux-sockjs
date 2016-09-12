import Emitter from '../../client/emitter'
import EventEmitter from 'events'
import noop from 'lodash/noop'

describe('client/emitter', () => {

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
  })

  it('send', () => {
    const spy = expect.spyOn(emitter.connection, 'send')
    const data = {xxx: 'sfdsdfdsf'}
    emitter.connection.onopen()
    emitter.send(data)
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

})
