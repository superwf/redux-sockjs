import isAction from './isAction'

/*
 * use redux as channelName, and check data must has "type" property
 * other usages are same as Channel
 * */
export default Parent => class ReduxChannel extends Parent {
  constructor(connection) {
    super(connection, 'redux')
  }

  ondata(data) {
    if (!isAction(data.data)) {
      throw new Error(`redux channel data should has redux data and has "type" in redux object ${JSON.stringify(data)}`)
    }
    super.ondata(data)
  }

  /* check redux "type" attribute
   * and emit with type and channel by this.emitter to browser
   * */
  send(action) {
    if (!isAction(action)) {
      throw new Error('emit redux data should has "type"')
    }
    super.send(action)
  }
}
