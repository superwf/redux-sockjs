import sockjs from 'sockjs'
// import { makeEmitter } from './eventEmitter'
import identity from 'lodash/identity'
import Channel from './channel'
import defaultHttpServer from './defaultHttpServer'
// import store from './store'

export default ({
  port = 3060,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs',
  requestListeners = [],
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

  if (requestListeners.length) {
    requestListeners.forEach(listener => httpServer.addListener('request', listener))
  }

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix })
  httpServer.listen(port, ip)
  return { channel, httpServer }
}
