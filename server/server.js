const express = require('express');
const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');

const app = express();
const filesMiddleware = express.static('public');
app.use('/', filesMiddleware);

const typeDefs = fs.readFileSync('./server/schema.graphql', 'utf-8');

let aboutMessage = 'Hello GraphQL world!';

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
};

const resolvers = {
  Query: {
    about: () => aboutMessage,
  },
  Mutation: {
    setAboutMessage,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen(3000, function () {
  console.log('app started');
});
