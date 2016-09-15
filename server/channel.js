// import identity from 'lodash/identity'
// import EventEmitter from 'events'
import Emitter from './emitter'
import generateChannel from '../lib/channel'

export default generateChannel(Emitter)
