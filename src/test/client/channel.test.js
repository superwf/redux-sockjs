import EventEmitter from 'events'
import Channel from '../../client/channel'
import Emitter from '../../client/emitter'

describe('client/channel', function clientChannelTest() {
  this.slow(1000)
  let channel
  let socket
  const channelName = 'A'

  beforeEach(() => {
    socket = new EventEmitter()
    socket.send = () => {}
    channel = new Channel(socket, channelName)
  })

  afterEach(() => {
    channel.destroy()
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
    expect(channel._ondataFuncs).toEqual(new Map())
  })

  it('onopen and channel emit "open"', done => {
    expect(channel.emitter.listeners('data')).toEqual([channel.ondata])
    expect(channel.emitter.listeners('close')).toEqual([channel.onclose])
    channel.on('open', () => {
      done()
    })
    channel.emitter.emit('open')
  })

  it('receiveFunc will be the func bind to channel', () => {
    const func = expect.createSpy()
    channel.receive(func)
    expect(channel._ondataFuncs.get(func)).toEqual(func.bind(channel))
    expect(func).toNotHaveBeenCalled()
    channel._ondataFuncs.get(func)()
    expect(func).toHaveBeenCalled()

    const func1 = () => {}
    channel.receive(func1)
    expect(channel._ondataFuncs.get(func1)).toEqual(func1.bind(channel))
  })

  it('remove', () => {
    const func = expect.createSpy()
    channel.receive(func)
    expect(func).toNotHaveBeenCalled()
    channel.ondata()
    expect(func).toNotHaveBeenCalled()
    channel.ondata({ type: 'channel', channel: channelName })
    expect(func.calls.length).toBe(1)
    channel.remove(func)
    channel.ondata({ type: 'channel', channel: channelName })
    expect(func.calls.length).toBe(1)
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
      const spy = expect.createSpy()
      channel.on('close', spy)
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
      expect(channel.listeners('abc').length > 0).toBe(false)
    })
  })

  it('reconnect, no server on port 30000, so "close" will be emitted immediately', done => {
    const socket1 = new EventEmitter()
    socket1.url = 'http://127.0.0.1:30000/sockjs-redux'
    const channel1 = new Channel(socket1, 'redux')
    const originEmitter = channel1.emitter
    const spy = expect.spyOn(channel1, 'reconnect').andCallThrough()
    channel1.reconnect(5, 4)
    expect(channel1.retryCount).toBe(4)
    expect(channel1.maxRetry).toBe(4)

    let time = 4
    channel1.on('close', () => {
      expect(channel1.retryCount).toBe(time)
      time -= 1
    })

    expect(originEmitter.listeners('close').length).toBe(0)
    expect(channel1.emitter).toNotBe(originEmitter)
    expect(channel1.emitter.listeners('open').length).toBe(2)
    expect(channel1.emitter.listeners('data').length).toBe(1)
    expect(channel1.emitter.listeners('close').length).toBe(2)
    setTimeout(() => {
      expect(spy.calls.length).toBe(4)
      done()
    }, 50)
  })
})
