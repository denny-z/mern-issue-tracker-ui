import React from 'react';
import {
  Table,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import IssueRow from './IssueRow.jsx';
import { getCurrentPageIssueIds } from './redux/selectors.js';

function IssueTable() {
  const issueIds = useSelector(getCurrentPageIssueIds);
  if (issueIds.length === 0) {
    return (<h3>There are no issues for now ;)</h3>);
  }

  const issuesList = issueIds.map((
    issueId => (
      <IssueRow
        key={issueId}
        issueId={issueId}
      />
    )));


  return (
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created At</th>
          <th>Effort</th>
          <th>Due</th>
          <th>Title</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {issuesList}
      </tbody>
    </Table>
  );
}

export default IssueTable;
