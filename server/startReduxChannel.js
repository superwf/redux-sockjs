import sockjs from 'sockjs'
// import { makeEmitter } from './eventEmitter'
import ReduxChannel from './reduxChannel'
import defaultHttpServer from './defaultHttpServer'
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
  const reduxChannel = new ReduxChannel(sockserver)
  // reduxChannel.on('redux', data => {
  //   store.dispatch(data)
  // })

  const httpServer = server || defaultHttpServer()

  if (requestListeners.length) {
    requestListeners.forEach(listener => httpServer.addListener('request', listener))
  }

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix })
  httpServer.listen(port, ip)
  return { reduxChannel, httpServer }
}
