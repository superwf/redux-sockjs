import EventEmitter from 'events'
import identity from 'lodash/identity'
import Channel from '../../client/channel'
import Emitter from '../../client/emitter'

describe('client/channel', () => {
  let channel, socket, channelName = 'A'

  beforeEach(() => {
    socket = new EventEmitter()
    socket.send = () => {}
    channel = new Channel(socket, channelName)
  })

  it('constructor', () => {
    expect(channel.socket).toBe(socket)
    expect(channel.channelName).toBe(channelName)
    expect(channel.emitter).toBeA(Emitter)
    expect(channel._receiveFunc).toBe(identity)
  })

  it('onopen and channel emit "open"', done => {
    // const spy = expect.spyOn(channel, 'onopen').andCallThrough()
    channel.on('open', () => {
      expect(channel.emitter.listeners('data')).toEqual([channel.ondata])
      expect(channel.emitter.listeners('close')).toEqual([channel.onclose])
      done()
    })
    expect(channel.emitter.listeners('data')).toEqual([])
    expect(channel.emitter.listeners('close')).toEqual([])
    channel.emitter.emit('open')
    // expect(spy).toHaveBeenCalled()
  })

  it('receiveFunc', () => {
    const func = () => {}
    channel.receive(func)
    expect(channel._receiveFunc).toBe(func)

    const func1 = () => {}
    channel.receive(func1)
    expect(channel._receiveFunc).toBe(func1)
  })

  it('send', () => {
    const spy = expect.spyOn(channel.emitter, 'send')
    const data = {abc: 123}
    channel.send(data)
    expect(spy).toHaveBeenCalledWith({ type: 'channel', channel: channelName, data})
  })

  describe('after emitter onopen', () => {
    beforeEach(() => {
      channel.emitter.emit('open')
    })

    it('emitter ondata', done => {
      const data = {type: 'channel', channel: channelName, data: {xxx: 55555}}
      channel.receive(message => {
        expect(data.data).toEqual(message)
        done()
      })
      channel.emitter.emit('data', data)
    })

    it('emitter onclose', () => {
      const spy = expect.spyOn(channel, 'destroy')
      channel.emitter.emit('close')
      expect(spy).toHaveBeenCalled()
    })

    it('destroy', () => {
      expect(channel.emitter.listeners('open').length > 0).toBe(true)
      expect(channel.emitter.listeners('data').length > 0).toBe(true)
      expect(channel.emitter.listeners('close').length > 0).toBe(true)
      channel.on('abc', () => {})
      expect(channel.listeners('abc').length > 0).toBe(true)
      channel.receive(() => {})

      channel.destroy()

      expect(channel.emitter.listeners('open').length > 0).toBe(false)
      expect(channel.emitter.listeners('data').length > 0).toBe(false)
      expect(channel.emitter.listeners('close').length > 0).toBe(false)
      expect(channel.listeners('abc').length > 0).toBe(false)
      expect(channel._receiveFunc).toBe(identity)
    })
  })

})
