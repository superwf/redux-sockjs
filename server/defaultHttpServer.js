import http from 'http'
import log4js from 'log4js'
import express from 'express'
import logger from './logger'

export default () => {
  const app = express()
  app.use(log4js.connectLogger(logger, { level: log4js.levels.DEBUG }))
  app.get('/', (req, res) => {
    res.end('hello')
  })
  const server = http.createServer(app)
  server.addListener('upgrade', (req, res) => {
    res.end()
  })
  return server
}
