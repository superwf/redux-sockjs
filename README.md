redux with sockjs
=================

## Test

```js
npm test
```

## Usage
### in server

```js
import { startStever } from 'redux-sockjs'
const channel = startServer({
  port: 1000, // port should be same with browser
})

channel.receive(action => {
  console.log(action) // action is sent from browser
  // here should do some redux operation
  // store.dispatch(action)
  store.dispatch(action)
  channel.send(store.getState())
})

```

### in browser use webpack or browserify
```js
import { startClient } from 'redux-sockjs'
const channel = startClient({
  port: 1000, // port should be same with server
})
channel.receive(action => {
  console.log(action)
})
channel.on('open', () => {
  channel.send({type: 'ADD_USER', payload: 'bob'})
})

channel.receive(action => {
  console.log(action) // action is sent from server
  // or do some redux operation
  store.dispatch(action)
})
```

### startServer param
```js
startServer({
  port = 3060,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs',
  log = () => {}, // a function for log of sockjs, reference from [sockjs-node doc](https://github.com/sockjs/sockjs-node)
  server, // server should be http.Server instance or some instance like express inherite from http.Server, if not defined, will use a default http server
})
```

### startClient param
```js
startClient({
  port = 3060,
  domain = '127.0.0.1',
  sockjsPrefix = '/sockjs',
  protocal = 'http',
})
```
