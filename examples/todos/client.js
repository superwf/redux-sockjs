import { Provider } from 'react-redux'
import { render } from 'react-dom'
import React from 'react'

import Todos from './containers/Todos'
import store from './store'
import { channel } from './actions/createAction'

channel.on('open', () => {
  render(<Provider store={store}><Todos /></Provider>, document.getElementById('main'))
})
