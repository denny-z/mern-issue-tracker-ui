/* eslint-disable import/prefer-default-export */

// TODO: Reuse this constant in other places. [reuse-status-constant]
// E.g. select for IssueFilter component
export const ISSUE_STATUS_LIST = Object.freeze(['New', 'Assigned', 'Fixed', 'Closed']);

// IDEA: Define single approach, to define issue fields.
//   Typescript class can be introduced. Similar to what's in GraphQL Schema.
//   OR see [graph-fragment] tag.
export const ISSUE_FIELDS = Object.freeze([
  'id',
  'title',
  'status',
  'owner',
  'effort',
  'created',
  'due',
  'description',
]);
