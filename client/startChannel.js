import SockJS from 'sockjs-client'
import Channel from './channel'


export default ({
  port = 3060,
  ip = '127.0.0.1',
  sockjsPrefix = '/sockjs',
  protocal = 'http',
  channelName,
} = {}) => {
  const socket = new SockJS(`${protocal}://${ip}:${port}${sockjsPrefix}`)
  const channel = new Channel(socket, channelName)
  return channel
}
