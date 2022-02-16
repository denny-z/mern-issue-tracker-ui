/* eslint-disable no-undef */
import { getFieldsListDiff } from './objectUtils.js';

const originalIssue = {
  id: 58,
  title: 'Lorem ipsum dolor sit amet, 55',
  owner: 'Eddie',
  status: 'Closed',
  created: '2021-11-21T20:35:20.868Z',
  effort: 1,
  due: '2021-11-11T20:35:20.868Z',
  description: 'NEW update of issue #58',
};

test('returns status changed', () => {
  const changedIssue = { ...originalIssue, status: 'New' };
  expect(getFieldsListDiff(originalIssue, changedIssue)).toEqual(['status']);
});

test('returns nothing as status changed to the same', () => {
  const changedIssue = { ...originalIssue, status: 'Closed' };
  expect(getFieldsListDiff(originalIssue, changedIssue)).toEqual([]);
});

test('resturns multiple fields changed', () => {
  const changedIssue = { ...originalIssue, effort: null, owner: 'Shaun' };
  expect(getFieldsListDiff(originalIssue, changedIssue)).toEqual(['owner', 'effort']);
});
