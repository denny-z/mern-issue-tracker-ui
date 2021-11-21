/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import {
  Button, Glyphicon, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import UserContext from './UserContext.jsx';

class IssueRowPlain extends React.Component {
  render() {
    const {
      issue,
      location: { search },
      closeIssue,
      deleteIssue,
    } = this.props;

    const { user } = this.context;

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
            <Button
              type="button"
              bsSize="xsmall"
              onClick={(e) => { onClose(e, issue.id); }}
              disabled={issue.status === 'Closed' || !user.isSignedIn}
            >
              <Glyphicon glyph="remove" />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger delay={1000} overlay={showDeleteTooltip} placement="top">
            <Button
              type="button"
              bsSize="xsmall"
              onClick={(e) => { onDelete(e, issue.id); }}
              disabled={!user.isSignedIn}
            >
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
  }
}

IssueRowPlain.contextType = UserContext;
const IssueRow = withRouter(IssueRowPlain);
delete IssueRow.contextType;
export default IssueRow;
