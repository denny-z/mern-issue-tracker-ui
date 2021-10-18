const express = require('express');
const fs = require('fs');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind, parseValue } = require('graphql/language');
const { parse } = require('path');

const app = express();
const filesMiddleware = express.static('public');
app.use('/', filesMiddleware);

const typeDefs = fs.readFileSync('./server/schema.graphql', 'utf-8');

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'This is JSON date',
  serialize(value) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const dateValue = new Date(ast.value);
      return isNaN(dateValue) ? undefined : dateValue;
    }
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
});

let aboutMessage = 'Hello GraphQL world!';

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
};

function validateIssue(issue) {
  const errors = [];
  if (issue.title.length < 3) {
    errors.push('Field "title" should be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned".');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

function addIssue(_, { issue }) {
  validateIssue(issue);
  issue.created = new Date();
  issue.id = issuesDB.length + 1;
  if (issue.status == undefined) issue.status = 'New';
  issuesDB.push(issue);
  return issue;
};

const issuesDB = [
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
    issuesList: () => issuesDB,
  },
  Mutation: {
    setAboutMessage,
    addIssue,
  },
  GraphQLDate,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: error => {
    console.error(error);
    return error;
  }
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen(3000, function () {
  console.log('app started');
});
