import startServer from '../../server/startReduxChannel'
import startClient from '../../client/startReduxChannel'

describe('startReduxChannel for server and client', () => {
  it('emit redux', done => {
    const param = {
      ip: '127.0.0.1',
      port: 10000,
      sockjsPrefix: '/sockjs-prefix',
    }
    const { reduxChannel: serverChannel, httpServer } = startServer(param)
    const clientChannel = startClient(param)

    const clientData = {type: 'abc', payload: 'xxxxx'}
    clientChannel.on('open', () => {
      clientChannel.emit(clientData)
    })
    serverChannel.on('redux', data => {
      expect(data).toEqual(clientData)
      httpServer.close()
      serverChannel.emitter.connection.close()
      done()
    })
  })
})
