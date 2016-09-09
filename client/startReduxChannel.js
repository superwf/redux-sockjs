import SockJS from 'sockjs-client'
import ReduxChannel from './reduxChannel'


export default ({
  port = 3060,
  ip = '127.0.0.1',
  sockjsPrefix = '/sockjs',
  protocal = 'http',
}) => {
  const socket = new SockJS(`${protocal}://${ip}:${port}${sockjsPrefix}`)
  const reduxChannel = new ReduxChannel(socket)
  return reduxChannel
}
