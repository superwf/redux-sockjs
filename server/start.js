import sockjs from 'sockjs'
import { makeEmitter } from '../server/eventEmitter'
import defaultHttpServer from './defaultHttpServer'
import warn from '../lib/warn'

// import reducer from './reducer'
// import store from './store'


export default ({
  port = 3060,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs',
  requestListeners = [],
  server, // server should be http.Server instance or some instance like express inherite from http.Server
}) => {
  const sockserver = sockjs.createServer({
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
  })
  sockserver.on('connection', conn => {
    const emitter = makeEmitter(conn)
    // const emitter = new EventEmitter(conn)
    warn(emitter)
  })

  const httpServer = server || defaultHttpServer()

  if (requestListeners.length) {
    requestListeners.forEach(listener => httpServer.addListener('request', listener))
  }

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix })
  httpServer.listen(port, ip)
}
