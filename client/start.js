import SockJS from 'sockjs-client'
import { makeEmitter } from './eventEmitter'

const socket = new SockJS('http://127.0.0.1:3060/sockjs')

const emitter = makeEmitter(socket)

emitter.emit('data', {
  type: 'channel',
  channel: 'redux',
  redux: { type: 'abc', payload: 'xxx' },
})

// sockjs.onopen = () => {
//   sockjs.onmessage(e => {
//     const data = JSON.parse(e.data)
//     evt.emit(`${data.type}:${data.uuid}`, data.payload)
//   })
// }
