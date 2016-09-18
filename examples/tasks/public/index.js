import { startReduxClient } from 'redux-sockjs';

const clientChannel = startReduxClient({
  port: 3000,
  sockjsPrefix: '/sockjs-redux',
})

clientChannel.on('open', () => {
  console.log('open from client')
})