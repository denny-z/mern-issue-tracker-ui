const express = require('express');
const fs = require('fs');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

const typeDefs = fs.readFileSync('./schema.graphql', 'utf-8');

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

const issuesCollectionName = 'issues';

async function addIssue(_, { issue }) {
  validateIssue(issue);
  issue.created = new Date();

  issue.id = await getNextSequence(issuesCollectionName);
  if (issue.status == undefined) issue.status = 'New';

  const issues = db.collection(issuesCollectionName);

  const result = await issues.insertOne(issue);
  const savedIssue = await issues.findOne({ _id: result.insertedId });
  return savedIssue;
};

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
  formatError: error => {
    console.error(error);
    return error;
  }
});

const enableCors = (process.env.ENABLE_CORS || 'true') == 'true';
console.log('CORS setting:', enableCors);
server.applyMiddleware({ app, path: '/graphql', cors: enableCors });

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

const port = process.env.API_SERVER_PORT || 3000;

(async () => {
  try {
    await connectToDB();

    app.listen(port, function () {
      console.log(`API server started on port ${port}`);
    });
  } catch (e) {
    console.error('ERROR:\n', e);
  }
})();
