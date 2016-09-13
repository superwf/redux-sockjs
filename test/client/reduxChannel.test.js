import EventEmitter from 'events'
import ReduxChannel from '../../client/reduxChannel'
import Channel from '../../client/channel'

describe('client/reduxChannel', () => {
  let socket
  let reduxChannel

  beforeEach(() => {
    socket = new EventEmitter()
    socket.send = () => {}
    reduxChannel = new ReduxChannel(socket)
    reduxChannel.emitter.emit('open')
  })

  it('inherite from Channel', () => {
    expect(reduxChannel).toBeA(Channel)
    expect(reduxChannel.channelName).toBe('redux')
  })

  it('emit data type should be "redux"', done => {
    const data = {
      type: 'channel',
      channel: 'redux',
      data: { type: 'abc', payload: [1, 2, 3] },
    }
    reduxChannel.receive(msg => {
      expect(msg).toEqual(data.data)
      done()
    })

    reduxChannel.emitter.emit('data', data)
  })

  it('redux channel data if no "data" or no "type" in "data", should throw error', () => {
    const data1 = {
      type: 'channel',
      channel: 'redux',
    }
    expect(() => {
      reduxChannel.emitter.emit('data', data1)
    }).toThrow()

    const data2 = {
      type: 'channel',
      channel: 'redux',
      data: { name: 'xxx' },
    }
    expect(() => {
      reduxChannel.emitter.emit('data', data2)
    }).toThrow()
  })

  it('ondata receive the data with data.data and data.data.type', () => {
    const data = {
      type: 'channel',
      channel: 'redux',
      data: {
        type: 'ADD',
        payload: 'baby',
      },
    }
    const spy = expect.createSpy()
    reduxChannel.receive(spy)
    reduxChannel.emitter.emit('data', data)
    expect(spy).toHaveBeenCalledWith(data.data)
  })

  it('send wrong data without data or data.type', () => {
    expect(() => {
      reduxChannel.send()
    }).toThrow()

    expect(() => {
      reduxChannel.send({})
    }).toThrow()

    const spy = expect.spyOn(socket, 'send')
    reduxChannel.send({
      type: 'XXX',
    })
    expect(spy).toHaveBeenCalled()
  })
})
