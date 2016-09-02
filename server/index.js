import http from 'http'
import sockjs from 'sockjs'
// import reducer from './reducer'
import store from './store'

/* eslint-disable no-console */
const warn = msg => console.warn(msg)
/* eslint-enable no-console */

const sockserver = sockjs.createServer({
  sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
})
sockserver.on('connection', conn => {
  // console.log(conn.headers)
  conn.on('data', async (data) => {
    const action = JSON.parse(data)
    await store.dispatch(action)
    // const state = store.getState()
    conn.write(JSON.stringify({ ok: true, payload: action.payload, uuid: action.uuid }))
  })

  conn.on('end', () => {
    warn('end')
  })

  conn.on('close', () => {
    warn('closecloseclosecloseclose')
    conn.destroy()
    // clearInterval(timer)
  })

  conn.on('clientError', () => {
    warn('clientError')
    conn.destroy()
    // clearInterval(timer)
  })
})

const server = http.createServer((req, res) => {
  warn(req.headers)
  res.end()
})

server.addListener('upgrade', (req, res) => {
  warn('res.end()')
  res.end()
})

sockserver.installHandlers(server, { prefix: '/sockjs' })
server.listen(3060, '0.0.0.0')
