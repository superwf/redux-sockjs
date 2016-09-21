import SockJS from 'sockjs-client'
import ReduxChannel from './reduxChannel'


export default ({
  port = 3000,
  domain = '127.0.0.1',
  sockjsPrefix = '/sockjs-redux',
  protocal = 'http',
  reconnectInterval = 0,
  reconnectMax = 0,
} = {}) => {
  const connectUrl = `${protocal}://${domain}:${port}${sockjsPrefix}`
  const socket = new SockJS(connectUrl)
  const reduxChannel = new ReduxChannel(socket)
  if (reconnectInterval > 0 && reconnectMax > 0) {
    reduxChannel.reconnect(reconnectInterval, reconnectMax)
  }
  return reduxChannel
}
