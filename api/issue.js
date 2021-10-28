const { UserInputError } = require('apollo-server-express');
const { getNextSequence, getDb } = require('./db');

const issuesCollectionName = 'issues';

async function list(_, { status }) {
  const filter = {};
  if (status) filter.status = status;
  return getDb().collection(issuesCollectionName).find(filter).toArray();
}

function validate(issue) {
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

async function add(_, { issue }) {
  validate(issue);
  const newIssue = Object.assign({}, issue);
  newIssue.created = new Date();

  newIssue.id = await getNextSequence(issuesCollectionName);
  if (newIssue.status === undefined) newIssue.status = 'New';

  const issues = getDb().collection(issuesCollectionName);

  const result = await issues.insertOne(newIssue);
  const savedIssue = await issues.findOne({ _id: result.insertedId });
  return savedIssue;
}

module.exports = { add, list };
