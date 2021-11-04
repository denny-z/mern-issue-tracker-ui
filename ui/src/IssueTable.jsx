import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button, Glyphicon, OverlayTrigger, Tooltip, Table,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

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
  const showEditTooltip = (
    <Tooltip id="edit-tooltip">Edit Issue</Tooltip>
  );

  const onClose = (e, id) => {
    e.preventDefault();
    closeIssue(id);
  };

  const onDelete = (e, id) => {
    e.preventDefault();
    deleteIssue(id);
  };

  const tableRow = (
    <tr>
      <td>{issue.id}</td>
      <td>{issue.status}</td>
      <td>{issue.owner}</td>
      <td>{issue.created.toDateString()}</td>
      <td>{issue.effort}</td>
      <td>{issue.due ? issue.due.toDateString() : ' '}</td>
      <td>{issue.title}</td>
      <td>
        <LinkContainer to={`/edit/${issue.id}`}>
          <OverlayTrigger delay={1000} overlay={showEditTooltip} placement="top">
            <Button bsSize="xsmall">
              <Glyphicon glyph="edit" />
            </Button>
          </OverlayTrigger>
        </LinkContainer>
        <OverlayTrigger delay={1000} overlay={showCloseTooltip} placement="top">
          <Button type="button" bsSize="xsmall" onClick={(e) => { onClose(e, issue.id); }} disabled={issue.status === 'Closed'}>
            <Glyphicon glyph="remove" />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger delay={1000} overlay={showDeleteTooltip} placement="top">
          <Button type="button" bsSize="xsmall" onClick={(e) => { onDelete(e, issue.id); }}>
            <Glyphicon glyph="trash" />
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  );

  return (
    <LinkContainer to={selectLocation}>
      {tableRow}
    </LinkContainer>
  );
});
