const { UserInputError } = require('apollo-server-express');
const { getNextSequence, getDb } = require('./db');
const { mustBeSignedIn } = require('./auth');

const collectionName = 'issues';
const deletedCollectionName = 'deleted_issues';

function getCollection() {
  return getDb().collection(collectionName);
}

function getDeletedCollection() {
  return getDb().collection(deletedCollectionName);
}

function processFilter({
  status, effortMin, effortMax, search,
}) {
  const filter = {};

  if (status) filter.status = status;

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) filter.effort.$gte = effortMin;
    if (effortMax !== undefined) filter.effort.$lte = effortMax;
  }
  if (search) filter.$text = { $search: search };

  return filter;
}

async function get(_, { id }) {
  return getCollection().findOne({ id });
}

const PAGE_SIZE = 10;

async function list(_, { page, ...filterArgs }) {
  const filter = processFilter(filterArgs);

  let currentPage = parseInt(page, 10);
  if (Number.isNaN(currentPage) || page < 0) currentPage = 1;

  const cursor = getCollection().find(filter)
    .sort({ id: 1 })
    .skip(PAGE_SIZE * (currentPage - 1))
    .limit(PAGE_SIZE);

  const totalCount = await cursor.count(false);
  const issues = cursor.toArray();
  const pages = Math.ceil(totalCount / PAGE_SIZE);
  return { issues, pages };
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

async function restore(_, { id }) {
  const issues = getCollection();
  const deletedIssues = getDeletedCollection();

  const issue = await deletedIssues.findOne({ id });
  if (!issue) return false;
  // IMP-DIFF: "restored" field used to indicate field is restoredez instead of "deleted".
  issue.restored = new Date();

  const insertResult = await issues.insertOne(issue);
  if (insertResult.insertedId) {
    const deleteResult = await deletedIssues.removeOne({ id });
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
  add: mustBeSignedIn(add),
  list,
  get,
  update: mustBeSignedIn(update),
  delete: mustBeSignedIn(remove),
  restore: mustBeSignedIn(restore),
  count,
};
