import 'babel-polyfill'
import expect from 'expect'

global.expect = expect

global.sleep = async (time) => new Promise(resolve => {
  setTimeout(() => {
    resolve()
  }, time)
})
