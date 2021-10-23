const express = require('express');
const fs = require('fs');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

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

server.applyMiddleware({ app, path: '/graphql' });

const dbUrl = "mongodb+srv://dbUser:90yd51pl6n2XbqZX@cluster0.oetds.mongodb.net/issuetracker?retryWrites=true&w=majority";
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

(async () => {
  try {
    await connectToDB();

    app.listen(3000, function () {
      console.log('app started');
    });
  } catch (e) {
    console.error('ERROR:\n', e);
  }
})();
