import http from 'http'

export default () => {
  const server = http.createServer()
  server.addListener('upgrade', (req, res) => {
    res.end()
  })
  return server
}
