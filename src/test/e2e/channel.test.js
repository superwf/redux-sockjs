import startServer from '../../server/startChannel'
import startClient from '../../client/startChannel'

describe('start channel for server and client', () => {
  it('client channel send data to server', done => {
    const param = {
      // ip: '127.0.0.1',
      // port: 10001,
      // sockjsPrefix: '/sockjs-prefix',
      channelName: 'channel test name',
    }
    const { channel: serverChannel, httpServer } = startServer(param)
    const clientChannel = startClient(param)

    const clientData = { type: 'abc', payload: 'xxxxx' }
    serverChannel.receive(data => {
      expect(data).toEqual(clientData)
      serverChannel.emitter.connection.close()
      httpServer.close()
      done()
    })
    clientChannel.on('open', () => {
      clientChannel.send(clientData)
    })
  })

  it('different channel channelName', done => {
    const param = {
      ip: '127.0.0.1',
      port: 10001,
      sockjsPrefix: '/sockjs-prefix',
      channelName: 'channel test name',
    }
    const { channel: serverChannel, httpServer } = startServer(param)
    const clientChannel = startClient({ ...param, channelName: 'other channel' })

    const clientData = { type: 'abc', payload: 'xxxxx' }
    const spy = expect.createSpy()
    serverChannel.receive(spy)
    clientChannel.on('open', () => {
      clientChannel.send(clientData)
      expect(spy).toNotHaveBeenCalled()
      serverChannel.emitter.connection.close()
      httpServer.close()
      done()
    })
  })

  it('server channel send data to client', done => {
    const param = {
      ip: '127.0.0.1',
      port: 10001,
      sockjsPrefix: '/sockjs-prefix',
      channelName: 'channel test name',
    }
    const { channel: serverChannel, httpServer } = startServer(param)
    const clientChannel = startClient(param)

    const serverData = { type: 'abc', payload: 'xxxxx' }
    clientChannel.receive(data => {
      expect(data).toEqual(serverData)
      clientChannel.emitter.connection.close()
      httpServer.close()
      done()
    })
    serverChannel.on('open', () => {
      serverChannel.send(serverData)
    })
  })
})
