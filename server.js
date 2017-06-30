const express = require('express')
const cors = require('cors')
const expressGraphQL = require('express-graphql')
const schema = require('./schema')

const app = express()

app.use(cors());

app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true,
}))

app.listen('3001', () => {
    console.log('Express server listening on port 3001')
})