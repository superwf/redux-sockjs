import SockJS from 'sockjs-client'
import Emitter from './emitter'
import generateChannel from '../lib/channel'

const Channel = generateChannel(Emitter)

class ClientChannel extends Channel {
  reconnect(interval, maxRetry) {
    this.emitter.destroy()
    this.socket = new SockJS(this.socket.url)
    const emitter = new Emitter(this.socket)
    emitter.on('open', this.onopen)
    emitter.on('data', this.ondata)
    emitter.on('close', this.onclose)
    if (interval > 0 && maxRetry > 1) {
      emitter.on('close', () => {
        emitter.destroy()
        this.emit('reconnecting')
        setTimeout(() => {
          this.reconnect(interval, maxRetry - 1)
        }, interval)
      })
    }
    this.emitter = emitter
  }
}

export default ClientChannel
