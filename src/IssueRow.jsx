/* eslint-disable react/prefer-stateless-function */
import React, { useContext } from 'react';
import {
  Button, Glyphicon, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import UserContext from './UserContext.jsx';
import { getIssue, getIssueLoading } from './redux/selectors.js';
import {
  issueClose, issueDelete, showSuccessNotificationComponent,
} from './redux/actions.js';

import './components/toatsComponents/IssueRestore.jsx';

function IssueRowPlain({
  issueId,
  location: { search, pathname },
  history,
}) {
  const { user } = useContext(UserContext);
  const issue = useSelector(state => getIssue(state, issueId));
  const isLoading = useSelector(state => getIssueLoading(state, issueId));
  const dispatch = useDispatch();

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

  const onClose = (e) => {
    e.preventDefault();
    dispatch(issueClose(issueId));
  };

  const onDelete = (e) => {
    e.preventDefault();

    const onSuccess = () => {
      dispatch(showSuccessNotificationComponent('IssueRestore', { issueId }));

      if (pathname === `/issues/${issueId}`) {
        history.push({ pathname: '/issues', search });
      }
    };
    dispatch(issueDelete(issueId, onSuccess));
  };

  const isCloseDisabled = issue.status === 'Closed'
      || !user.signedIn
      || isLoading;

  const isDeleteDisabled = !user.signedIn || isLoading;

  return (
    <LinkContainer to={selectLocation}>
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
              onClick={onClose}
              disabled={isCloseDisabled}
            >
              <Glyphicon glyph="remove" />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger delay={1000} overlay={showDeleteTooltip} placement="top">
            <Button
              type="button"
              bsSize="xsmall"
              onClick={onDelete}
              disabled={isDeleteDisabled}
            >
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    </LinkContainer>
  );
}

export default withRouter(IssueRowPlain);
