const graphql = require('graphql')
const axios = require('axios')

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLSchema,
    GraphQLNonNull
} = graphql

const TodoType = new GraphQLObjectType({
    name: 'Todo',
    fields: {
        id: {type: GraphQLString},
        text: {type: GraphQLString},
        complete: {type: GraphQLBoolean}
    }
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        todos: {
            type: new GraphQLList(TodoType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3002/todos`)
                    .then(resp => resp.data)
            }
        },
        todo: {
            type: TodoType,
            args: {id: {type: GraphQLString}},
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3002/todos/${args.id}`)
                    .then(resp => resp.data)
            }
        }
    }
})

const Mutations = new GraphQLObjectType({
    name: 'mutation',
    fields: {
        addTodo: {
            type: TodoType,
            args: {
                text: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                complete: {
                    type: new GraphQLNonNull(GraphQLBoolean)
                }
            },
            resolve(root, {text, complete}) {
                return axios.post(`http://localhost:3002/todos/`, {
                    id: String(Math.random()),
                    text,
                    complete
                }).then(resp => resp.data)
            }
        },
        deleteTodo: {
            type: TodoType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(root, {id}){
                axios.delete(`http://localhost:3002/todos/${id}`)
                    .then(resp => resp.data)
            }
        },
        toggleCompleteTodo: {
            type: TodoType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                complete: {
                    type: new GraphQLNonNull(GraphQLBoolean)
                }
            },
            resolve(root, {id, complete}){
                axios.patch(`http://localhost:3002/todos/${id}`, {complete: !complete})
                    .then(resp => resp.data)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutations
})