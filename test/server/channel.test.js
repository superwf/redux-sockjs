import Channel from '../../server/channel'
import EventEmitter from 'events'

describe('server/channel', () => {

  it('emit', () => {
    const emitter = new EventEmitter()
    const spy = expect.spyOn(emitter, 'emit')
    const channelA = new Channel(emitter, 'A')
    const data = {abc: 123}
    channelA.emit(data)
    expect(spy).toHaveBeenCalledWith({ type: 'channel', channel: 'A', data})
  })

  it('constructor', () => {
    const emitter = new EventEmitter()
    const channel = new Channel(emitter, 'A')
    expect(channel.identity).toBe('A')
    expect(channel.emitter).toBe(emitter)
  })

  it('on data', done => {
    const emitter = new EventEmitter()
    const channel = new Channel(emitter, 'A')
    const data = {type: 'channel', channel: 'A', xxx: 55555}
    channel.on('data', message => {
      expect(data).toEqual(message)
      done()
    })
    emitter.emit('data', data)
  })

  it('on close and invoke channel destroy', () => {
    const emitter = new EventEmitter()
    const channel = new Channel(emitter, 'A')
    expect(emitter.listeners('data')).toEqual([channel.ondata])
    expect(emitter.listeners('close')).toEqual([channel.onclose])
    const spy = expect.spyOn(channel, 'destroy').andCallThrough()
    emitter.emit('close')
    expect(spy).toHaveBeenCalled()
    expect(emitter.listeners('data')).toEqual([])
    expect(emitter.listeners('close')).toEqual([])
  })

})
