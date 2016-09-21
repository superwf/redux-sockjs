import { actionCreator, startReduxClient } from 'redux-sockjs'

const channel = startReduxClient({
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})

const createAction = actionCreator(channel)

export { channel, createAction }
