import React, { Component } from 'react'
import './App.css'
import {
  gql,
  ApolloClient,
  createNetworkInterface,
  ApolloProvider,
  graphql
} from 'react-apollo'

const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3001/graphql'
  })
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
    this.props.mutate({
      variables: {
        text: this.state.newTodo,
        complete: false,
      },
      refetchQueries: [
        {query} //reference to the query defined below
      ]
    }).then(() => console.log('mutation complete'))
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

const query = gql`
  {
    todos {
      id
      text
      complete
    }
  }
`

const mutation =  gql`
  mutation addTodo($text: String!, $complete: Boolean!) {
    addTodo(text: $text, complete: $complete) {
      id
      text
      complete
    }
  }
`

const TodosWithData = graphql(mutation)(graphql(query)(Todos))

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
