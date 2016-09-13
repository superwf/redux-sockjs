/*
 * use redux as channelName, and check data must has "type" property
 * other usages are same as Channel
 * */
export default Parent => class ReduxChannel extends Parent {
  constructor(connection) {
    super(connection, 'redux')
  }

  ondata(data) {
    if (!data.data || !data.data.type) {
      throw new Error('redux channel data should has redux data and has "type" in redux object')
    }
    super.ondata(data)
  }

  /* check redux "type" attribute
   * and emit with type and channel by this.emitter to browser
   * */
  send(data) {
    if (!data || !data.type) {
      throw new Error('emit redux data should has "type"')
    }
    super.send(data)
  }
}
