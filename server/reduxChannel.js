import Channel from './channel'

class ReduxChannel extends Channel {
  constructor(server) {
    super(server, 'redux')
  }

  ondata(data) {
    if (data.type === 'channel' && data.channel === this.identity) {
      if (!data.redux || !data.redux.type) {
        throw new Error('redux channel data should has redux data and has "type" in redux object')
      }
      return super._emit('redux', data.redux)
    }
    return super._emit('data', data)
  }

  /* check redux "type" attribute
   * and emit with type and channel by this.emitter to browser
   * */
  emit(data) {
    if (!data || !data.type) {
      throw new Error('emit redux data should has "type"')
    }
    return this.emitter.emit({
      type: 'channel',
      channel: this.identity,
      redux: data,
    })
  }
}

export default ReduxChannel
