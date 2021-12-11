/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import {
  Button, Glyphicon, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { connect } from 'react-redux';
import UserContext from './UserContext.jsx';
import { getIssue, getIssueLoading } from './redux/selectors.js';

class IssueRowPlain extends React.Component {
  render() {
    const {
      issue,
      location: { search },
      closeIssue,
      deleteIssue,
      isLoading,
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

    const isCloseDisabled = issue.status === 'Closed'
      || !user.signedIn
      || isLoading;

    const isDeleteDisabled = !user.signedIn || isLoading;

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
              disabled={isCloseDisabled}
            >
              <Glyphicon glyph="remove" />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger delay={1000} overlay={showDeleteTooltip} placement="top">
            <Button
              type="button"
              bsSize="xsmall"
              onClick={(e) => { onDelete(e, issue.id); }}
              disabled={isDeleteDisabled}
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

// TODO: [react-redux] [move-methods] Move issue actions from IssueList to IssueRow.
const mapStateToProps = (state, { issueId: id }) => ({
  issue: getIssue(state, id),
  isLoading: getIssueLoading(state, id),
});
const Connected = connect(mapStateToProps)(IssueRowPlain);

const IssueRow = withRouter(Connected);
delete IssueRow.contextType;
export default IssueRow;
