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

const initialIssues = [
  {
    id: 1,
    status: 'New',
    owner: 'Ravan',
    effort: 5,
    created: new Date('2018-08-15'),
    due: undefined,
    title: 'Error in console when clicking Add',
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    effort: 14,
    created: new Date('2018-08-16'), due: new Date('2018-08-30'),
    title: 'Missing bottom border on panel',
  }
];

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issuesList: () => initialIssues,
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
