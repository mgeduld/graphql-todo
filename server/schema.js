const graphql = require('graphql')
const axios = require('axios')

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLSchema
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

module.exports = new GraphQLSchema({
    query: RootQuery
})