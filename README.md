redux with sockjs
=================

[![build status](https://img.shields.io/travis/acdlite/redux-promise/master.svg?style=flat-square)](https://travis-ci.org/superwf/redux-sockjs)

## Test

```js
npm test
```

## Usage
for es6 project, use stage-0 syntax
### on server

```js
import { startReduxServer } from 'redux-sockjs/server'
const channel = startReduxServer({
  port: 1000, // port should be same with browser
})

channel.receive(action => {
  channel.broadcast(action)
})
```

### on browser use webpack or browserify
```js
import { startReduxClient, createAction as createReduxAction, middleware as reduxSockjs, createReducer } from 'redux-sockjs'

// when use createReduxAction, the reduxSockjs must be used and vice versa

const channel = startReduxClient({
  port: 1000, // port should be same with server
})

// channel must bound to createAction first, then use redux middle to create store
const createAction = createReduxAction(channel)

const createUser = createAction('ADD_USER')

const userReducer = createReducer({
  'INITIAL_STATE': (state, action) => action.payload,
  'ADD_USER': (state, action) => [...state, action.payload],
}, [])

// use reduxPromise before reduxSockjs
const store = createStore(combineReducers({
  user: userReducer,
}), applyMiddleware(reduxPromise, reduxSockjs))

channel.on('open', () => {
  store.dispatch(createUser({ name: 'bob' }))
})

// it is async, when data send to server and broadcast to browser
// store.getState().user will be [{ name: 'bob' }]

```

if some server operation take too long, you can use promise action
```js
import { startReduxClient, createAction as createReduxAction, middleware as reduxSockjs } from 'redux-sockjs'

// when use createReduxAction, the reduxSockjs must be used and vice versa

const channel = startReduxClient({
  port: 1000, // port should be same with server
})

// channel must bound to createAction first, then use redux middle to create store
const createAction = createReduxAction(channel)

const createUser = createAction('ADD_USER', true)

const userReducer = createReducer({
  'INITIAL_STATE': (state, action) => action.payload,
  'ADD_USER': (state, action) => [...state, action.payload],
}, [])

// use reduxPromise before reduxSockjs
const store = createStore(combineReducers({
  user: userReducer,
}), applyMiddleware(reduxPromise, reduxSockjs))

channel.on('open', async () => {
  await store.dispatch(createUser({ name: 'bob' }))
  console.log(store.getState().user) // [{ name: 'bob' }]
})

// it is async, when data send to server and broadcast to browser
// store.getState().user will be [{ name: 'bob' }]

```

## API

### startServer param
if no param, just startServer(), it will use default param as below
```js
startReduxServer({
  port = 3000,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs-redux',
  log = () => {}, // a function for log of sockjs, reference from [sockjs-node doc](https://github.com/sockjs/sockjs-node)
  server, // server should be http.Server instance, if not defined, will use default server created by http.createServer()
  // use https.createServer() when needed
})
```

### startClient param

if no param, just startClient(), it will use default param as below
the protocal should correspond to the server protocal
```js
startReduxClient({
  port = 3000,
  domain = '127.0.0.1', // domain name or ip
  sockjsPrefix = '/sockjs-redux',
  protocal = 'http', // http or https
})
```
