import React, { Component } from 'react'
import './App.css'
import {
  gql,
  ApolloClient,
  createNetworkInterface,
  ApolloProvider,
  graphql,
  compose
} from 'react-apollo'
import {propType} from 'graphql-anywhere'

const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3001/graphql'
  })
})

class Todo extends Component {

  static fragments = {
    todoParts: gql`
      fragment TodoParts on Todo {
        id
        text
        complete
      }
    `
  }

  static propTypes = {
    todo: propType(Todo.fragments.todoParts).isRequired
  }

  render() {
    const {todo, onToggleCompleteTodo, onDeleteTodo} = this.props;
    return (
      <li 
        style={{color: todo.complete ? 'green' : 'red'}}
      >
        <span onClick={() => onToggleCompleteTodo(todo.id, todo.complete)}>{todo.text}</span> 
        <span onClick={() => onDeleteTodo(todo.id)}>[X]</span>
      </li>
    )
  }
}

class Todos extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newTodo: '',
    }
  }

  onSubmit(event) {
    event.preventDefault()
    this.props.addTodo({
      variables: {
        text: this.state.newTodo,
        complete: false,
      },
      refetchQueries: [
        {query} //reference to the query defined below
      ]
    }).then(() => console.log('mutation complete'))
    this.setState({newTodo: ''})
  }

  onDeleteTodo = id => {
    this.props.deleteTodo({
      variables: {
        id
      },
      refetchQueries: [
        {query} //reference to the query defined below
      ]
    })
  }

  onToggleCompleteTodo = (id, complete) => {
    this.props.toggleCompleteTodo({
      variables: {
        id,
        complete
      },
      refetchQueries: [
        {query} //reference to the query defined below
      ]
    })
  }

  render() {
    const {data: {loading, todos}} = this.props;
    if (loading) {
      return <div>Loading...</div>
    }
    return  (
      <div>
        <h3>Todos</h3>
        <ul>
          {todos.map(todo => (
            <Todo
              key={todo.id}
              todo={todo} 
              onToggleCompleteTodo={this.onToggleCompleteTodo}
              onDeleteTodo={this.onDeleteTodo}
            />
          ))}
        </ul>

        <form onSubmit={this.onSubmit.bind(this)}>
          <label>Add Todo:</label>
          <input value={this.state.newTodo} onChange={event => this.setState({newTodo: event.target.value})} />
        </form>
      </div>
    )
  }
}

const query = gql`
  {
    todos {
      ...TodoParts
    }
  }
  ${Todo.fragments.todoParts}
`

const addTodoMutation =  gql`
  mutation addTodo($text: String!, $complete: Boolean!) {
    addTodo(text: $text, complete: $complete) {
      id
      text
      complete
    }
  }
`
const deleteTodoMutation =  gql`
  mutation deleteTodo($id: String!) {
    deleteTodo(id: $id) {
      id
      text
      complete
    }
  }
`

const toggleCompleteTodoMutation =  gql`
  mutation toggleCompleteTodo($id: String!, $complete: Boolean!) {
    toggleCompleteTodo(id: $id, complete: $complete) {
      id
      text
      complete
    }
  }
`

const TodosWithData = compose(
  graphql(addTodoMutation, { name: 'addTodo' }),
  graphql(deleteTodoMutation, { name: 'deleteTodo' }),
  graphql(toggleCompleteTodoMutation, { name: 'toggleCompleteTodo' }),
  graphql(query)
)(Todos)

class App extends Component {
  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <TodosWithData />
      </ApolloProvider>
    )
  }
}

export default App;
