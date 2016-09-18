import http from 'http'
// import express from 'express'
import { startReduxServer } from '../../index'

// const app = express()
// app.use(express.static(`${__dirname}/public`))

const server = http.createServer()

const { channel: reduxChannel } = startReduxServer({
  server,
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})

reduxChannel.receive(action => {
  reduxChannel.broadcast(action)
})
