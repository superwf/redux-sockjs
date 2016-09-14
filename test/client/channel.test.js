import EventEmitter from 'events'
import identity from 'lodash/identity'
import Channel from '../../client/channel'
import Emitter from '../../client/emitter'

describe('client/channel', () => {
  let channel
  let socket
  const channelName = 'A'

  beforeEach(() => {
    socket = new EventEmitter()
    socket.send = () => {}
    channel = new Channel(socket, channelName)
  })

  it('if no channelName, will throw', () => {
    expect(() => {
      channel = new Channel(socket)
    }).toThrow()
  })

  it('constructor', () => {
    expect(channel.socket).toBe(socket)
    expect(channel.channelName).toBe(channelName)
    expect(channel.emitter).toBeA(Emitter)
    expect(channel._receiveFunc).toBe(identity)
  })

  it('onopen and channel emit "open"', done => {
    channel.on('open', () => {
      expect(channel.emitter.listeners('data')).toEqual([channel.ondata])
      expect(channel.emitter.listeners('close')).toEqual([channel.onclose])
      done()
    })
    expect(channel.emitter.listeners('data')).toEqual([])
    expect(channel.emitter.listeners('close')).toEqual([])
    channel.emitter.emit('open')
  })

  it('receiveFunc will be the func bind to channel', () => {
    const func = expect.createSpy()
    channel.receive(func)
    expect(channel._receiveFunc).toEqual(func.bind(channel))
    expect(func).toNotHaveBeenCalled()
    channel._receiveFunc()
    expect(func).toHaveBeenCalled()

    const func1 = () => {}
    channel.receive(func1)
    expect(channel._receiveFunc).toEqual(func1.bind(channel))
  })

  it('send', () => {
    const spy = expect.spyOn(channel.emitter, 'send')
    const data = { abc: 123 }
    channel.send(data)
    expect(spy).toHaveBeenCalledWith({ type: 'channel', channel: channelName, data })
  })

  describe('after emitter onopen', () => {
    beforeEach(() => {
      channel.emitter.emit('open')
    })

    it('emitter same channel, ondata can receive', done => {
      const data = { type: 'channel', channel: channelName, data: { xxx: 55555 } }
      channel.receive(message => {
        expect(data.data).toEqual(message)
        done()
      })
      channel.emitter.emit('data', data)
    })

    it('emitter different channel name will not be recevied', () => {
      const data = { type: 'channel', channel: channelName, data: { xxx: 55555 } }
      const spy = expect.createSpy()
      channel.receive(spy)
      channel.emitter.emit('data', data)
      expect(spy.calls.length).toBe(1)
      channel.emitter.emit('data', data)
      expect(spy.calls.length).toBe(2)

      channel.emitter.emit('data', { type: 'channel', channel: 'other channel', data: { xxx: 55555 } })
      expect(spy.calls.length).toBe(2)
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
