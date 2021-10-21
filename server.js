const express = require('express')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')
const joinMonster = require('join-monster')

// Connect to database
const { Client } = require('pg')
const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "ayushi",
  database: "login"
})
client.connect()

// Define the schema
const Person = new graphql.GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    id: { type: graphql.GraphQLString },
    first_name: { type: graphql.GraphQLString },
    last_name: { type: graphql.GraphQLString }
    
  })
});

Person._typeConfig = {
  sqlTable: 'person',
  uniqueKey: 'id',
}


const MutationRoot = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    person: {
      type: Person,
      args: {
        first_name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        last_name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) }
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO person (first_name, last_name) VALUES ($1, $2) RETURNING *", [args.first_name, args.last_name])).rows[0]
        } catch (err) {
          throw new Error("Failed to insert new person")
        }
      }
    }
  })
})

const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    hello: {
      type: graphql.GraphQLString,
      resolve: () => "Hello world!"
    },
    persons: {
      type: new graphql.GraphQLList(Person),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
    person: {
      type: Person,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (personTable, args, context) => `${personTable}.id = ${args.id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
    
  })
})

const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot
});

// Create the Express app
const app = express();
app.use('/api', graphqlHTTP({
  schema: schema,
  graphiql: true
}));
app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/api");