/* global db print */
/* eslint no-restricted-globals: "off" */

// There is a difference in implementaion. I changed how initial count and initial ID initialized.
const owners = ['Ravan', 'Eddie', 'Pieta', 'Parvati', 'Victor'];
const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];

const issuesCollectionCounter = db.counters.findOne({ _id: 'issues' });
let initialId = 0;
if (issuesCollectionCounter) {
  initialId = issuesCollectionCounter.current;
} else {
  throw new Error('Error. "counters" collection for "issues.id" is not initialized.');
}

const issuesToAddCount = 100;
for (let i = 0; i < issuesToAddCount; i += 1) {
  const randomCreatedDate = (new Date())
 - Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
  const created = new Date(randomCreatedDate);
  const randomDueDate = (new Date())
 - Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
  const due = new Date(randomDueDate);
  const owner = owners[Math.floor(Math.random() * 5)];
  const status = statuses[Math.floor(Math.random() * 4)];
  const effort = Math.ceil(Math.random() * 20);
  const title = `Lorem ipsum dolor sit amet, ${i}`;
  const id = initialId + i + 1;
  const issue = {
    id, title, created, due, owner, status, effort,
  };
  db.issues.insertOne(issue);
}
const count = db.issues.count();
const newCurrentId = initialId + issuesToAddCount;
db.counters.update({ _id: 'issues' }, { $set: { current: newCurrentId } });
print('New issue count:', count);
print('Last inserted Issue ID:', newCurrentId);
