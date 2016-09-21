import SockJS from 'sockjs-client'
import Channel from './channel'


export default ({
  port = 3000,
  domain = '127.0.0.1',
  sockjsPrefix = '/sockjs',
  protocal = 'http',
  channelName,
  reconnectInterval = 0,
  reconnectMax = 0,
} = {}) => {
  const connectUrl = `${protocal}://${domain}:${port}${sockjsPrefix}`
  const socket = new SockJS(connectUrl)
  const channel = new Channel(socket, channelName)
  if (reconnectInterval > 0 && reconnectMax > 0) {
    channel.once('close', () => {
      channel.reconnect(reconnectInterval, reconnectMax)
    })
  }
  return channel
}
