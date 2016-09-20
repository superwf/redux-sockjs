import http from 'http'
import { startReduxServer } from '../../server'

const server = http.createServer()

const reduxChannel = startReduxServer({
  server,
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})

reduxChannel.receive(action => {
  reduxChannel.broadcast(action)
})
