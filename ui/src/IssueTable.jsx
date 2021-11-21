import React from 'react';
import {
  Table,
} from 'react-bootstrap';
import IssueRow from './IssueRow.jsx';

export default function IssueTable(props) {
  const { issues, closeIssue, deleteIssue } = props;
  const issuesList = issues.map((
    issue => (
      <IssueRow
        key={issue.id}
        issue={issue}
        closeIssue={closeIssue}
        deleteIssue={deleteIssue}
      />
    )));

  if (issues.length === 0) {
    return (<h3>There are no issues for now ;)</h3>);
  }

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
