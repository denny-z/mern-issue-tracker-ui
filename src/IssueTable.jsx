import React from 'react';
import {
  Table,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import IssueRow from './IssueRow.jsx';
import { getCurrentPageIssueIds } from './redux/selectors.js';

function IssueTable(props) {
  const { issueIds, closeIssue, deleteIssue } = props;
  const issuesList = issueIds.map((
    issueId => (
      <IssueRow
        key={issueId}
        issueId={issueId}
        closeIssue={closeIssue}
        deleteIssue={deleteIssue}
      />
    )));

  if (issueIds.length === 0) {
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

const mapStateToProps = state => ({
  issueIds: getCurrentPageIssueIds(state),
});
export default connect(mapStateToProps)(IssueTable);
