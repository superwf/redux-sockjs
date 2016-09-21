import SockJS from 'sockjs-client'
import Channel from './channel'
import reconnect from './reconnect'


export default ({
  port = 3000,
  domain = '127.0.0.1',
  sockjsPrefix = '/sockjs',
  protocal = 'http',
  channelName,
  reconnectInterval = 5000,
} = {}) => {
  const connectUrl = `${protocal}://${domain}:${port}${sockjsPrefix}`
  const socket = new SockJS(connectUrl)
  const channel = new Channel(socket, channelName)
  if (reconnectInterval > 0) {
    const reconnectChannel = reconnect(reconnectInterval)
    channel.on('close', () => reconnectChannel(channel))
  }
  return channel
}
