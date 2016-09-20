import generate from '../lib/reduxChannel'
import Channel from './channel'

const ReduxChannel = generate(Channel)

class ReduxServerChannel extends ReduxChannel {
  broadcast(data, includeSelf = true) {
    this.emitter.broadcast({ type: 'channel', channel: this.channelName, data }, includeSelf)
  }
}

export default ReduxServerChannel
