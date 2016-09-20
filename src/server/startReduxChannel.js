import sockjs from 'sockjs'
import identity from '../lib/identity'
import ReduxChannel from './reduxChannel'
import defaultHttpServer from './defaultHttpServer'
// import store from './store'

export default ({
  port = 3000,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs-redux',
  log = identity,
  server, // server should be http.Server instance or some instance like express inherite from http.Server
} = {}) => {
  const sockserver = sockjs.createServer({
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
    log,
  })
  const channel = new ReduxChannel(sockserver)

  const httpServer = server || defaultHttpServer()

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix })
  httpServer.listen(port, ip)
  return channel
}
