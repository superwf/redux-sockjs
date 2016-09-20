import React, { Component } from 'react'
import reduxPromise from 'redux-promise'
import { createStore, combineReducers, applyMiddleware, bindActionCreators, compose } from 'redux'
import { connect, Provider } from 'react-redux'
import { render } from 'react-dom'
import { startReduxClient, createAction, middleware as reduxSockjsMiddleware } from 'redux-sockjs'

const clientChannel = startReduxClient({
  port: 3010,
  sockjsPrefix: '/sockjs-redux',
})


class App extends Component {
  constructor() {
    super()
    this.state = {
      name: '',
    }
  }

  renderUsers() {
    return <ul>
      {this.props.users.map((u, k) => <li key={k}>{u}</li>)}
    </ul>
  }

  addUser(e) {
    e.preventDefault()
    const { name } = this.state
    if (name) {
      this.props.createUser(name)
    }
  }

  render() {
    return <div>
      {this.renderUsers()}
      <form onSubmit={this.addUser.bind(this)}>
        <input type="text" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
        <input type="submit" />
      </form>
    </div>
  }
}

const create = createAction(clientChannel)

const createUserAction = create('ADD_USER')


const Container = connect(state => ({
  users: state.users,
}), dispatch => bindActionCreators({ createUser: createUserAction }, dispatch)
)(App)

const reducer = (state = [], action) => {
  switch (action.type) {
    case 'INITIAL_STATE':
      return action.payload
    case 'ADD_USER':
      return [...state, action.payload]
    default:
      return state
  }
}

const store = createStore(combineReducers({
  users: reducer,
}), compose(
  applyMiddleware(reduxPromise, reduxSockjsMiddleware),
  global.devToolsExtension ? global.devToolsExtension() : f => f
))

clientChannel.on('open', () => {
  render(<Provider store={store}><Container /></Provider>, document.getElementById('main'))
})
