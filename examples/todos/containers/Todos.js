import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Todos from '../components/Todos'
import { create, list, destroy } from '../actions/todo'

export default connect(state => ({
  todos: state.todos,
}), dispatch => bindActionCreators({ create, list, destroy }, dispatch)
)(Todos)
