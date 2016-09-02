import SockJS from 'sockjs-client'
import Event from 'events'
import uuid from 'uuid'

const evt = new Event()

const sockjs = new SockJS('http://127.0.0.1:3060/sockjs')

sockjs.onopen = () => {
  sockjs.onmessage(e => {
    const data = JSON.parse(e.data)
    evt.emit(`${data.type}:${data.uuid}`, data.payload)
  })
}

const ADD = 'ADD'

const add = task => new Promise((resolve, reject) => {
  const uid = uuid.v1()
  sockjs.send(JSON.stringify({ type: ADD, payload: task, uuid: uid }))
  evt.once(`${ADD}:${uid}`, data => {
    if (data.ok) {
      resolve(data)
    } else {
      reject(data)
    }
  })
})

export default add
