import Channel from '../../server/channel'
import EventEmitter from 'events'
// import stream from 'stream'

describe('server/channel', () => {
  let server, channel, connection, channelName

  beforeEach(() => {
    server = new EventEmitter()
    channelName = 'A'
    connection = new EventEmitter()
    connection.write = () => {}
    channel = new Channel(server, channelName)
    server.emit('connection', connection)
  })

  it('emit', () => {
    const data = {abc: 123}
    const spy = expect.spyOn(channel.emitter, 'emit')
    channel.emit(data)
    expect(spy).toHaveBeenCalledWith({ type: 'channel', channel: channelName, data})
  })

  it('constructor', () => {
    expect(channel.identity).toBe(channelName)
    expect(channel.server).toBe(server)
  })

  it('ondata', done => {
    const data = {type: 'channel', channel: channelName, xxx: 55555}
    channel.on('data', message => {
      expect(data).toEqual(message)
      done()
    })
    channel.emitter._emit('data', data)
  })

  it('on close and invoke channel destroy', () => {
    expect(server.listeners('connection')).toEqual([channel.onconnection])
    expect(channel.emitter.listeners('data')).toEqual([channel.ondata])
    expect(channel.emitter.listeners('close')).toEqual([channel.onclose])
    const spy = expect.spyOn(channel, 'destroy').andCallThrough()
    channel.emitter._emit('close')
    expect(spy).toHaveBeenCalled()
    expect(channel.emitter.listeners('data')).toEqual([])
    expect(channel.emitter.listeners('close')).toEqual([])
  })

  it('_emit invoke super.emit', done => {
    const evtName = 'xxxxx'
    const data = {xxx: 12242}
    channel.on(evtName, msg => {
      expect(msg).toBe(data)
      done()
    })
    channel._emit(evtName, data)
  })
})
