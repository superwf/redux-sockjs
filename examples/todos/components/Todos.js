import React, { Component, PropTypes } from 'react'

class Todos extends Component {
  static propTypes = {
    todos: PropTypes.array.isRequired,
    destroy: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    list: PropTypes.func.isRequired,
  }

  constructor() {
    super()
    this.state = {
      title: 'xxx',
    }
  }

  componentWillMount() {
    this.props.list()
  }

  renderTodos() {
    return <ul>
      {this.props.todos.map((todo, k) => <li key={k}><button onClick={() => {
        this.props.destroy(todo)
      }}>Delete</button>{todo.title}</li>)}
    </ul>
  }

  addTodo(e) {
    e.preventDefault()
    const { title } = this.state
    if (title) {
      this.props.create({ title })
    }
  }

  render() {
    return <div>
      <form onSubmit={this.addTodo.bind(this)}>
        <input type="text" value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
        <button type="submit">Submit</button>
      </form>
      {this.renderTodos()}
    </div>
  }
}

export default Todos
