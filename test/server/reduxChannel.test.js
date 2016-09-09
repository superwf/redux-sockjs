import ReduxChannel from '../../server/reduxChannel'
import Channel from '../../server/channel'
import EventEmitter from 'events'

describe('server/reduxChannel', () => {
  let server, reduxChannel, connection, channelName

  beforeEach(() => {
    server = new EventEmitter()
    connection = new EventEmitter()
    connection.write = () => {}
    reduxChannel = new ReduxChannel(server)
    server.emit('connection', connection)
  })

  it('inherite from Channel', () => {
    expect(reduxChannel).toBeA(Channel)
  })

  it('emit data type should be "redux"', done => {
    const data = {
      type: 'channel',
      channel: 'redux',
      redux: {type: 'abc', param: [1, 2, 3]},
    }
    reduxChannel.on('redux', msg => {
      expect(msg).toEqual(data.redux)
      done()
    })

    reduxChannel.emitter._emit('data', data)
  })

  it('redux channel if no redux or redux type, should throw', () => {
    const data1 = {
      type: 'channel',
      channel: 'redux',
    }
    expect(() => {
      emitter.emit('data', data1)
    }).toThrow()

    const data2 = {
      type: 'channel',
      channel: 'redux',
      redux: {name: 'xxx'},
    }
    expect(() => {
      emitter.emit('data', data2)
    }).toThrow()
  })
})
