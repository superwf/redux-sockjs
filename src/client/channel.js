import SockJS from 'sockjs-client'
import Emitter from './emitter'
import generateChannel from '../lib/channel'

const Channel = generateChannel(Emitter)

class ClientChannel extends Channel {
  reconnect(interval, maxRetry) {
    if (maxRetry) {
      this.maxRetry = maxRetry
      this.retryCount = maxRetry
    } else {
      this.retryCount -= 1
    }
    this.emitter.destroy()
    this.socket = new SockJS(this.socket.url)
    const emitter = new Emitter(this.socket)
    emitter.on('open', this.onopen)
    emitter.once('open', () => {
      this.retryCount = this.maxRetry
    })
    emitter.on('data', this.ondata)
    emitter.on('close', this.onclose)
    if (interval > 0 && this.retryCount > 1) {
      emitter.on('close', () => {
        emitter.destroy()
        this.emit('reconnecting')
        setTimeout(() => {
          this.reconnect(interval)
        }, interval)
      })
    }
    this.emitter = emitter
  }
}

export default ClientChannel
