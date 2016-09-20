import sockjs from 'sockjs'
import identity from '../lib/identity'
import Channel from './channel'
import defaultHttpServer from './defaultHttpServer'
// import store from './store'

export default ({
  port = 3000,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs',
  channelName,
  log = identity,
  server, // server should be http.Server instance or some instance like express inherite from http.Server
} = {}) => {
  const sockserver = sockjs.createServer({
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
    log,
  })
  const channel = new Channel(sockserver, channelName)

  const httpServer = server || defaultHttpServer()

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix })
  httpServer.listen(port, ip)
  return { channel, httpServer }
}
