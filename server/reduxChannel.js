import findIndex from 'lodash/findIndex'
import generate from '../lib/reduxChannel'
import Channel from './channel'

const ReduxChannel = generate(Channel)

// all instance of ReduxServerChannel
const Channels = []

class ReduxServerChannel extends ReduxChannel {
  constructor(...args) {
    super(...args)
    Channels.push(this)
  }

  destroy() {
    super.destroy()
    const index = findIndex(Channels, this)
    Channels.splice(index, 1)
  }

  broadcast(action, includeSelf = true) {
    Channels.forEach(channel => {
      if (!includeSelf && this === channel) {
        return
      }
      channel.emitter.emit(action)
    })
  }
}

export { Channels }

export default ReduxServerChannel
