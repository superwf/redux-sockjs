import http from 'http'
import { isFSA } from 'flux-standard-action'
import remove from 'lodash/remove'
import { startReduxServer } from '../../server'

function isPromise(promise) {
  return promise && promise.then && typeof promise.then === 'function'
}

const server = http.createServer()

const reduxChannel = startReduxServer({
  server,
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})

/* simulate async db operation */
const database = []
let id = 0
const insert = item => {
  item.id = ++id
  database.push(item)
  return Promise.resolve(item)
}

const list = () => {
  return Promise.resolve(database)
}

const destroy = id => {
  remove(database, { id })
  return Promise.resolve(id)
}

/* when I start this project, I imagine both server and client will use redux
 * but write code on server I found that if each time broadcast the whole store by store.getState(),
 * that will transfer too many useless data
 * so just transfer needed data is ok
 * on server, I use half redux mode, only use the action idea of redux
 * */

const actions = {
  ADD_TODO: action => ({ ...action, payload: insert(action.payload) }),
  LIST_TODO: action => ({ ...action, payload: list() }),
  DESTROY_TODO: action => ({ ...action, payload: destroy(action.payload) }),
}

const broadcast = reduxChannel.broadcast.bind(reduxChannel)
reduxChannel.receive(action => {
  const result = actions[action.type](action)
  if (isPromise(result.payload)) {
    result.payload.then(data => {
      broadcast({ ...action, payload: data })
    })
  } else if (isFSA(result)) {
    broadcast(result)
  }
})
