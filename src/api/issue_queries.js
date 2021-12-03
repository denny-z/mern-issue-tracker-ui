/* eslint-disable import/prefer-default-export */

// INFO: This is an experimental technique to extract queries from the places where they called.

import { ISSUE_STATUS_LIST } from '../constants.js';

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

export const ISSUE_PREVIEW_QUERY = `
  query SelectedIssue($id: Int!) {
    issue(id: $id) {
      id description
    }
  }
`;

export const ISSUE_CLOSE_QUERY = `
  mutation CloseIssue($id: Int!) {
    updateIssue(id: $id, changes: { status: Closed }) {
      id
      title
      status
      owner
      effort
      created
      due
      description
    }
  }
`;

export const ISSUE_DELETE_QUERY = `
  mutation DeleteIssue($id: Int!) {
    deleteIssue(id: $id)
  }
`;
