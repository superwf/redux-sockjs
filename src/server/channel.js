import Emitter from './emitter'
import generateChannel from '../lib/channel'

const Channel = generateChannel(Emitter)

class ServerChannel extends Channel {
  broadcast(data, includeSelf = true) {
    this.emitter.broadcast({ type: 'channel', channel: this.channelName, data }, includeSelf)
  }
}

export default ServerChannel
