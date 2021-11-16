const { UserInputError } = require('apollo-server-express');
const { getNextSequence, getDb } = require('./db');

const collectionName = 'issues';
const deletedCollectionName = 'deleted_issues';

function getCollection() {
  return getDb().collection(collectionName);
}

function getDeletedCollection() {
  return getDb().collection(deletedCollectionName);
}

function processFilter({ status, effortMin, effortMax }) {
  const filter = {};

  if (status) filter.status = status;

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) filter.effort.$gte = effortMin;
    if (effortMax !== undefined) filter.effort.$lte = effortMax;
  }

  return filter;
}

async function get(_, { id }) {
  return getCollection().findOne({ id });
}

async function list(_, filterArgs) {
  const filter = processFilter(filterArgs);

  return getCollection().find(filter).toArray();
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

  newIssue.id = await getNextSequence(collectionName);
  if (newIssue.status === undefined) newIssue.status = 'New';

  const issues = getCollection();

  const result = await issues.insertOne(newIssue);
  const savedIssue = await issues.findOne({ _id: result.insertedId });
  return savedIssue;
}

async function update(_, { id, changes }) {
  const issues = getCollection();

  if (changes.title || changes.status || changes.owner) {
    const issue = await issues.findOne({ id });
    Object.assign(issue, changes);
    validate(issue);
  }
  await issues.updateOne({ id }, { $set: changes });
  const savedIssue = issues.findOne({ id });
  console.log(savedIssue);
  return savedIssue;
}

async function remove(_, { id }) {
  const issues = getCollection();
  const deletedIssues = getDeletedCollection();

  const issue = await issues.findOne({ id });
  if (!issue) return false;
  issue.deleted = new Date();

  const insertResult = await deletedIssues.insertOne(issue);
  if (insertResult.insertedId) {
    const deleteResult = await issues.removeOne({ id });
    return deleteResult.deletedCount === 1;
  }
  return false;
}

async function count(_, filterArgs) {
  const filter = processFilter(filterArgs);
  const results = await getCollection().aggregate([
    { $match: filter },
    {
      $group:
      {
        _id: { status: '$status', owner: '$owner' },
        count: { $sum: 1 },
      },
    },
  ]).toArray();
  const stats = {};
  results.forEach((result) => {
    // eslint-disable-next-line no-underscore-dangle
    const { owner, status: statusKey } = result._id;
    if (!stats[owner]) stats[owner] = { owner };
    stats[owner][statusKey] = result.count;
  });
  return Object.values(stats);
}

module.exports = {
  add,
  list,
  get,
  update,
  delete: remove,
  count,
};
