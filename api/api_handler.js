const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');

const GraphQLDate = require('./graphql_date');
const about = require('./about');
const issue = require('./issue');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf-8');

const resolvers = {
  Query: {
    about: about.getMessage,
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error(error);
    return error;
  },
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  server.applyMiddleware({ app, path: '/graphql', cors: enableCors });
}

module.exports = { installHandler };
