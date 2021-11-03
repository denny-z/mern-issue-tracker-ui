import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import {
  Button, Glyphicon, OverlayTrigger, Tooltip,
} from 'react-bootstrap';

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
    <table className="bordered-table">
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
    </table>
  );
}

const IssueRow = withRouter(({
  issue,
  location: { search },
  closeIssue,
  deleteIssue,
}) => {
  const selectLocation = { pathname: `/issues/${issue.id}`, search };
  const showCloseTooltip = (
    <Tooltip id="close-tooltip">Close Issue</Tooltip>
  );
  const showDeleteTooltip = (
    <Tooltip id="delete-tooltip">Delete Issue</Tooltip>
  );

  return (
    <tr>
      <td>{issue.id}</td>
      <td>{issue.status}</td>
      <td>{issue.owner}</td>
      <td>{issue.created.toDateString()}</td>
      <td>{issue.effort}</td>
      <td>{issue.due ? issue.due.toDateString() : ' '}</td>
      <td>{issue.title}</td>
      <td>
        <Link to={`/edit/${issue.id}`}>Edit</Link>
        {' | '}
        <NavLink to={selectLocation}>Select</NavLink>
        {' | '}
        <OverlayTrigger delay={1000} overlay={showCloseTooltip} placement="top">
          <Button type="button" bsSize="xsmall" onClick={() => { closeIssue(issue.id); }} disabled={issue.status === 'Closed'}>
            <Glyphicon glyph="remove" />
          </Button>
        </OverlayTrigger>
        {' | '}
        <OverlayTrigger delay={1000} overlay={showDeleteTooltip} placement="top">
          <Button type="button" bsSize="xsmall" onClick={() => { deleteIssue(issue.id); }}>
            <Glyphicon glyph="trash" />
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  );
});
