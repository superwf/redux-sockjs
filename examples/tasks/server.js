import http from 'http';
import sockjs from 'sockjs';
import identity from 'lodash/identity';
import findIndex from 'lodash/findIndex';
import EventEmitter from 'events';
import SockJS from 'sockjs-client';
import uuid from 'uuid';

var isAction = action => Boolean(action && action.type)

/*
 * use redux as channelName, and check data must has "type" property
 * other usages are same as Channel
 * */
var generate = Parent => class ReduxChannel extends Parent {
  constructor(connection) {
    super(connection, 'redux')
  }

  ondata(data) {
    if (!isAction(data.data)) {
      throw new Error(`redux channel data should has redux data and has "type" in redux object ${JSON.stringify(data)}`)
    }
    super.ondata(data)
  }

  /* check redux "type" attribute
   * and emit with type and channel by this.emitter to browser
   * */
  send(action) {
    if (!isAction(action)) {
      throw new Error('emit redux data should has "type"')
    }
    super.send(action)
  }
}

/* eslint-disable no-console */
const warn = (...args) => console.warn(...args)

/* all sockjs should dispatch to instance of this class
 * */
const connections = []

class Emitter extends EventEmitter {
  constructor(socket) {
    super()
    this.socket = socket
    this.setMaxListeners(100)

    this.onconnection = this.onconnection.bind(this)
    socket.on('connection', this.onconnection)
    // console.log(socket.listeners('connection').length)
  }

  onconnection(connection) {
    connections.push(connection)
    // console.log(connections.length)
    this.connection = connection
    this.ondata = this.ondata.bind(this)
    connection.on('data', this.ondata)

    connection.on('close', () => {
      // this.emit('close')
      connection.removeAllListeners()
      connection.close()
      const index = findIndex(connections, connection)
      connections.splice(index, 1)
    })
    this.emit('open')
    // console.log('server emitter open')
  }

  ondata(message) {
    // console.log(message)
    try {
      const data = JSON.parse(message)
      this.emit('data', data)
    } catch (e) {
      warn(e)
    }
  }

  // emit data to connection
  // no eventName, only data
  send(data) {
    // console.log(data)
    this.connection.write(JSON.stringify(data))
  }

  broadcast(data, includeSelf = true) {
    // console.log('broadcast', data)
    connections.forEach(connection => {
      if (!includeSelf && this.connection === connection) {
        return
      }
      connection.write(JSON.stringify(data))
    })
  }

  destroy() {
    this.removeAllListeners()
  }
}

Emitter.connections = connections

// multiple channel for single connection
var generateChannel = Emitter => class Channel extends EventEmitter {
  /*
   * @param Object instance of server/eventEmitter
   * @param String channelName, channel name
   * */
  constructor(socket, channelName) {
    if (!channelName) {
      throw new Error('channel must has an channelName')
    }
    super()
    this.socket = socket
    this.channelName = channelName
    this._ondataFuncs = new Map()
    const emitter = new Emitter(socket)
    this.emitter = emitter
    this.onopen = this.onopen.bind(this)
    this.ondata = this.ondata.bind(this)
    this.onclose = this.onclose.bind(this)
    emitter.on('open', this.onopen)
    emitter.on('data', this.ondata)
    emitter.on('close', this.onclose)
  }

  onopen() {
    this.emit('open')
  }

  /* add func that will invoke when ondata */
  receive(func) {
    this._ondataFuncs.set(func, func.bind(this))
  }

  /* remove func that will invoke when ondata */
  remove(func) {
    this._ondataFuncs.delete(func)
  }

  ondata(data) {
    if (data && data.type === 'channel' && data.channel === this.channelName) {
      this._ondataFuncs.forEach(func => func(data.data))
    }
  }

  onclose() {
    this.destroy()
  }

 /* send with channel by this.emitter to browser
  */
  send(data) {
    this.emitter.send({ type: 'channel', channel: this.channelName, data })
  }

  // clear all listeners, free memory
  destroy() {
    this.removeAllListeners()
    this._ondataFuncs = null
    const { emitter } = this
    emitter.removeListener('open', this.onopen)
    emitter.removeListener('data', this.ondata)
    emitter.removeListener('close', this.onclose)
  }
}

// import identity from 'lodash/identity'
// import EventEmitter from 'events'
var Channel = generateChannel(Emitter)

const ReduxChannel = generate(Channel)

class ReduxServerChannel extends ReduxChannel {
  broadcast(data, includeSelf = true) {
    this.emitter.broadcast({ type: 'channel', channel: this.channelName, data }, includeSelf)
  }
}

var defaultHttpServer = () => {
  const server = http.createServer()
  // server.addListener('upgrade', (req, res) => {
  //   res.end()
  // })
  return server
}

// import store from './store'

var startReduxServer = ({
  port = 3060,
  ip = '0.0.0.0',
  sockjsPrefix = '/sockjs',
  // requestListeners = [],
  log = identity,
  server, // server should be http.Server instance or some instance like express inherite from http.Server
} = {}) => {
  const sockserver = sockjs.createServer({
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
    log,
  })
  const channel = new ReduxServerChannel(sockserver)

  const httpServer = server || defaultHttpServer()

  // if (requestListeners.length) {
  //   requestListeners.forEach(listener => httpServer.addListener('request', listener))
  // }

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix })
  httpServer.listen(port, ip)
  return { channel, httpServer }
}

/* all sockjs should dispatch to instance of this class
 * */
class Emitter$2 extends EventEmitter {
  constructor(connection) {
    super()
    this.connection = connection
    this.setMaxListeners(100)

    this.onmessage = this.onmessage.bind(this)

    this.connection.onopen = () => {
      this.emit('open')
    }

    this.connection.onmessage = this.onmessage

    this.connection.onclose = () => {
      this.emit('close')
      this.destroy()
    }
  }

  onmessage(evt) {
    try {
      const data = JSON.parse(evt.data)
      this.emit('data', data)
    } catch (e) {
      warn(e)
    }
  }

  // send data to socket
  // no eventName, only data
  send(data) {
    this.connection.send(JSON.stringify(data))
  }

  destroy() {
    this.removeAllListeners()
  }
}

var Channel$1 = generateChannel(Emitter$2)

generate(Channel$1)

const ActionTypes = {
  SOCKJS: '@@redux-sockjs',
  NOOP_ACTION: '@@redux-sockjs-noop',
}

/**
 * @param {Object} reducerMap
 * @param {any} initialState
 * @return {Function}
 */

// import express from 'express'
// const app = express()
// app.use(express.static(`${__dirname}/public`))

const server = http.createServer()

const { channel: reduxChannel } = startReduxServer({
  server,
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})

reduxChannel.receive(action => {
  console.log(action)
  reduxChannel.broadcast(action)
})