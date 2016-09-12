import EventEmitter from 'events'
import identity from 'lodash/identity'
import Channel from '../../server/channel'
import Emitter from '../../server/emitter'

describe('server/channel', () => {
  let socket, channel, connection, channelName = 'A'

  beforeEach(() => {
    socket = new EventEmitter()
    connection = new EventEmitter()
    connection.write = () => {}
    channel = new Channel(socket, channelName)
  })

  it('constructor', () => {
    expect(channel.channelName).toBe(channelName)
    expect(channel.socket).toBe(socket)
  })

  it('onopen', done => {
    expect(channel.emitter.listeners('open')).toEqual([channel.onopen])
    channel.on('open', () => {
      expect(channel.emitter).toBeA(Emitter)
      expect(channel.emitter.listeners('data')).toEqual([channel.ondata])
      expect(channel.emitter.listeners('close')).toEqual([channel.onclose])
      done()
    })
    channel.emitter.emit('open', connection)
  })

  describe('after socket connection', () => {
    beforeEach(() => {
      socket.emit('connection', connection)
    })
    it('send', () => {
      const data = {abc: 123}
      const spy = expect.spyOn(channel.emitter, 'send')
      channel.send(data)
      expect(spy).toHaveBeenCalledWith({ type: 'channel', channel: channelName, data})
    })

    it('ondata', done => {
      const data = {type: 'channel', channel: channelName, data: {xxx: 55555}}
      channel.receive(message => {
        expect(data.data).toEqual(message)
        done()
      })
      channel.emitter.emit('data', data)
    })

    it('on close and invoke channel destroy', () => {
      expect(channel.emitter.listeners('open')).toEqual([channel.onopen])
      expect(channel.emitter.listeners('data')).toEqual([channel.ondata])
      expect(channel.emitter.listeners('close')).toEqual([channel.onclose])
      channel.receive(() => {})
      const spy = expect.spyOn(channel, 'destroy').andCallThrough()
      channel.emitter.emit('close')
      expect(spy).toHaveBeenCalled()
      expect(channel.emitter.listeners('open')).toEqual([])
      expect(channel.emitter.listeners('data')).toEqual([])
      expect(channel.emitter.listeners('close')).toEqual([])
      expect(channel._receiveFunc).toBe(identity)
    })
  })
})
