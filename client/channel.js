import Emitter from './emitter'
import generateChannel from '../lib/channel'

export default generateChannel(Emitter)

// import identity from 'lodash/identity'
// import EventEmitter from 'events'
// import Emitter from './emitter'

// // multiple channel for single connection
// class Channel extends EventEmitter {
//   /*
//    * @param Object instance of client/eventEmitter
//    * @param String channelName, channel name
//    * */
//   constructor(socket, channelName) {
//     if (!channelName) {
//       throw new Error('channel must has an identity')
//     }
//     super()
//     this.socket = socket
//     this.channelName = channelName
//     this._receiveFunc = identity
//     this.onopen = this.onopen.bind(this)
//     const emitter = new Emitter(this.socket)
//     this.emitter = emitter
//     emitter.on('open', this.onopen)
//   }

//   onopen() {
//     this.ondata = this.ondata.bind(this)
//     this.onclose = this.onclose.bind(this)
//     this.emitter.on('data', this.ondata)
//     this.emitter.on('close', this.onclose)
//     this.emit('open')
//   }

//   receive(func) {
//     this._receiveFunc = func
//   }

//   ondata(data) {
//     if (data.type === 'channel' && data.channel === this.channelName) {
//       this._receiveFunc(data.data)
//     }
//     return null
//   }

//   onclose() {
//     return this.destroy()
//   }

//  /* send with channel by this.emitter to server
//   */
//   send(data) {
//     return this.emitter.send({ type: 'channel', channel: this.channelName, data })
//   }

//   // clear all listeners, free memory
//   destroy() {
//     this.removeAllListeners()
//     this._receiveFunc = identity
//     if (this.emitter) {
//       this.emitter.removeListener('open', this.onopen)
//       this.emitter.removeListener('data', this.ondata)
//       this.emitter.removeListener('close', this.onclose)
//     }
//     return null
//   }
// }

// export default Channel
