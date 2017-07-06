import React, { Component } from 'react'
import {applyMiddleware, combineReducers, createStore} from 'redux'
import {connect, Provider} from 'react-redux'
import {call, fork, put, takeEvery} from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga';
import axios from 'axios'

import './App.css'

const todos = (state = [], action) => {
  switch (action.type) {
    case 'hydrate':
      return action.value
    default:
      return state
  }
}

const reducers = combineReducers({todos});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

const fetchTodosFromGraphQL = () => axios.post('http://localhost:3001/graphql', {
  method: 'post',
  headers: {
    'content-type': 'application/json'
  },
  query: `
    query {
        todos {
          id
          text
          complete
        }
      }
  `,
})

function* fetchTodos() {
  const todos = yield call(fetchTodosFromGraphQL)
                              //why is this burried so deep?
  yield put({type: 'hydrate', value: todos.data.data.todos})
}

function* watchFetchRequest() {
  yield takeEvery('fetchTodos', fetchTodos)
}

function addTodoToDataSourceEndpoint(value) {
  console.log(value);
  axios.post('http://localhost:3002/todos', value);
}

function* addTodo(action) {
  yield call(addTodoToDataSourceEndpoint, action.value)
  yield put({type: 'fetchTodos'})
}

function* watchAddRequest() {
  yield takeEvery('addTodo', addTodo)
}

function* sagas() {
  yield [
    fork(watchAddRequest),
    fork(watchFetchRequest)
  ];
}

sagaMiddleware.run(sagas);

const mapStateToProps = state => ({
  todos: state.todos
})

class Todos extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newTodo: '',
    }
  }

  onSubmit(event) {
    event.preventDefault()
    this.props.dispatch({type: 'addTodo', value: {id: String(Math.random()), text: this.state.newTodo, complete: false}})
  }

  componentDidMount() {
    this.props.dispatch({type: 'fetchTodos'});
  }

  render() {
    return  (
      <div>
        <h3>Todos</h3>
        <ul>
          {this.props.todos.map(todo => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>

        <form onSubmit={this.onSubmit.bind(this)}>
          <label>Add Todo:</label>
          <input value={this.props.newTodo} onChange={event => this.setState({newTodo: event.target.value})} />
        </form>
      </div>
    )
  }
}

const ConnectedTodos = connect(mapStateToProps)(Todos);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedTodos />
      </Provider>
    )
  }
}

export default App;
