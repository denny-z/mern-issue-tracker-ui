/* eslint-disable import/prefer-default-export */

// INFO: This is an experimental technique to extract queries from the places where they called.

import { ISSUE_FIELDS, ISSUE_STATUS_LIST } from '../constants.js';

export const ISSUE_REPORT_QUERY = `
  query IssueReport(
    $status: StatusType
    $effortMin: Int
    $effortMax: Int
  ) {
    issueCounts(
      status: $status,
      effortMin: $effortMin
      effortMax: $effortMax
    ) {
      owner ${ISSUE_STATUS_LIST.join(' ')}
    }
  }
`;

export const ISSUE_LIST_QUERY = `
  query IssueList(
    $status: StatusType,
    $effortMin: Int,
    $effortMax: Int,
    $hasSelection: Boolean!,
    $selectedId: Int!,
    $page: Int
  ) {
    issuesList(
      status: $status
      effortMin: $effortMin
      effortMax: $effortMax
      page: $page
    ) {
      issues { 
        id
        title
        owner
        status
        created
        effort
        due
      }
      pages
    }
    
    issue(id: $selectedId) @include (if: $hasSelection) {
      id 
      description
    }
  }
`;

export const issueLoadQueryBuilder = (fieldsToLoad = ['id'], queryName = 'IssueLoad') => (
  `
  query ${queryName}($id: Int!) {
    issue(id: $id) {
      ${fieldsToLoad.join(' ')}
    }
  }
`);

export const ISSUE_PREVIEW_QUERY = issueLoadQueryBuilder(
  ['id', 'description'],
  'IssuePreview',
);

export const ISSUE_UPDATE_QUERY = `
  mutation IssueUpdate($id: Int!, $changes: IssueUpdateInputs!) {
    issueUpdate(id: $id, changes: $changes) {
      ${ISSUE_FIELDS.join(' ')}
    }
  }
`;

export const ISSUE_CLOSE_QUERY = `
  mutation IssueClose($id: Int!) {
    issueUpdate(id: $id, changes: { status: Closed }) {
      ${ISSUE_FIELDS.join(' ')}
    }
  }
`;

export const ISSUE_DELETE_QUERY = `
  mutation DeleteIssue($id: Int!) {
    deleteIssue(id: $id)
  }
`;

// TODO: [react-redux] [graph-fragment] Use fragment in ISSUES_LIST and ISSUE_RESTORE.
export const ISSUE_RESTORE_QUERY = `
  mutation RestoreIssue($id: Int!) {
    issueRestore(id: $id) {
      id
      title
      owner
      status
      created
      effort
      due
    }
  }
`;

// TODO: [react-redux] [graph-fragment] Use fragment in ISSUES_LIST and ISSUE_RESTORE.
export const ISSUE_CREATE_QUERY = `
  mutation AddIssue($issue: IssueInputs!) {
    addIssue(issue: $issue) {
      id
      title
      owner
      status
      created
      effort
      due
    }  
  }
`;
