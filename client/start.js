import SockJS from 'sockjs-client'
import Emitter from './emitter'

const socket = new SockJS('http://127.0.0.1:3060/sockjs')

const emitter = new Emitter(socket)

emitter.emit('data', {
  type: 'channel',
  channel: 'redux',
  redux: { type: 'abc', payload: 'xxx' },
})
