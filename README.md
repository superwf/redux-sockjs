redux with sockjs
=================

[![build status](https://img.shields.io/travis/acdlite/redux-promise/master.svg?style=flat-square)](https://travis-ci.org/superwf/redux-sockjs)

## Test

```bash
  npm test
```

## Usage
for es6 project, babel-preset-stage-0 syntax
### on server

```javascript
  import { startReduxServer } from 'redux-sockjs/server'
  const channel = startReduxServer({
    port: 1000, // port should be same with browser
  })

  channel.receive(action => {
    channel.broadcast(action)
  })
```

### on browser use webpack or browserify
```javascript
  import { startReduxClient, actionCreator, middleware as reduxSockjs, createReducer } from 'redux-sockjs'

  /* when use actionCreator, the reduxSockjs must be used and vice versa */

  const channel = startReduxClient({
    port: 1000, // port should be same with server
  })

  /* channel must bound to createAction first, then use redux middle to create store */
  const createAction = actionCreator(channel)

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
```javascript
  import { startReduxClient, createAction as actionCreator, middleware as reduxSockjs } from 'redux-sockjs'

  /* when use actionCreator, the reduxSockjs must be used and vice versa */

  const channel = startReduxClient({
    port: 1000, // port should be same with server
  })

  /* channel must bound to createAction first, then use redux middle to create store */
  const createAction = actionCreator(channel)

  const createUser = createAction('ADD_USER', true)

  const userReducer = createReducer({
    'INITIAL_STATE': (state, action) => action.payload,
    'ADD_USER': (state, action) => [...state, action.payload],
  }, [])

  /* use reduxPromise before reduxSockjs */
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

## Server API

### startReduxServer
if no param, just startServer(), it will use default param as below
```javascript
  startReduxServer({
    port = 3000,
    ip = '0.0.0.0',
    sockjsPrefix = '/sockjs-redux',
    log = () => {}, // a function for log of sockjs, reference from [sockjs-node doc](https://github.com/sockjs/sockjs-node)
    server, // server should be http.Server instance, if not defined, will use default server created by http.createServer()
    // use https.createServer() when needed
  })
```
### reduxChannel instance method

reduxChannel on server inherites nodejs "events", and has some own method as below

 * receive(func)

  can receive many functions, when receive data, each will be called with data

 * remove(func)

  remove func from receive data functions

 * send(data)

  send data to client async

 * broadcast(data)

   like send, but send data to all connected client

## Client API

### startReduxClient

if no param, just startClient(), it will use default param as below
the protocal should correspond to the server protocal
```javascript
  const reduxChannel = startReduxClient({
    port = 3000,
    domain = '127.0.0.1', // domain or ip
    sockjsPrefix = '/sockjs-redux',
    protocal = 'http', // http or https
    reconnectInterval = 0, // reconnect interval, millisecond
    reconnectMax = 0, // reconnect max retry count
  })
```

### reduxChannel instance method
reduxChannel on client inherites nodejs "events", and has some own method as below

 * reconnect(interval, maxRetry)

   when reconnect, it`s emitter property will be replaced new one

 * receive(func)

  can receive many functions, when receive data, each will be called with data

 * remove(func)

  remove func from receive data functions

 * send(data)

  send data to server async

### actionCreator

receive an return value of startReduxClient
return a function to create action
```javascript
  const createAction = actionCreator(reduxChannel)
  const actionAddTodo = createAction('ADD_TODO')
```
