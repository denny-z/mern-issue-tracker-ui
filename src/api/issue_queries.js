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
