const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');

const GraphQLDate = require('./graphql_date');
const about = require('./about');
const issue = require('./issue');
const auth = require('./auth');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf-8');

const resolvers = {
  Query: {
    about: about.getMessage,
    user: auth.resolveUser,
    issuesList: issue.list,
    issue: issue.get,
    issueCounts: issue.count,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    addIssue: issue.add,
    updateIssue: issue.update,
    deleteIssue: issue.delete,
    issueRestore: issue.restore,
  },
  GraphQLDate,
};

function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: getContext,
  formatError: (error) => {
    console.error(error);
    return error;
  },
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  let cors;
  if (enableCors) {
    const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
    cors = { origin, methods: 'POST', credentials: true };
  } else {
    cors = 'false';
  }
  server.applyMiddleware({ app, path: '/graphql', cors });
}

module.exports = { installHandler };
