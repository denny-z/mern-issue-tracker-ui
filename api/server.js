const express = require('express');
const fs = require('fs');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const dbUrl = process.env.DB_URL || 'mongodb://localhost/issuetracker';
let db;

async function issuesList() {
  return db.collection('issues').find({}).toArray();
}

async function connectToDB() {
  const client = new MongoClient(dbUrl, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db();
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

const app = express();

const typeDefs = fs.readFileSync('./schema.graphql', 'utf-8');

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'This is JSON date',
  serialize(value) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const dateValue = new Date(ast.value);
      return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
    }
    return undefined;
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
  },
});

let aboutMessage = 'Hello GraphQL world!';

function setAboutMessage(_, { message }) {
  aboutMessage = message;
  return message;
}

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

const issuesCollectionName = 'issues';

async function addIssue(_, { issue }) {
  validateIssue(issue);
  const newIssue = Object.assign({}, issue);
  newIssue.created = new Date();

  newIssue.id = await getNextSequence(issuesCollectionName);
  if (newIssue.status === undefined) newIssue.status = 'New';

  const issues = db.collection(issuesCollectionName);

  const result = await issues.insertOne(newIssue);
  const savedIssue = await issues.findOne({ _id: result.insertedId });
  return savedIssue;
}

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issuesList,
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
  formatError: (error) => {
    console.error(error);
    return error;
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const port = process.env.API_SERVER_PORT || 3000;

(async function start() {
  try {
    await connectToDB();

    app.listen(port, () => {
      console.log(`API server started on port ${port}`);
    });
  } catch (e) {
    console.error('ERROR:\n', e);
  }
}());
