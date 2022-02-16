import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { issueRestore, showSuccessNotification } from '../../redux/actions.js';
import dynamicComponents from '../dynamicComponents.js';

export default function IssueRestore({ issueId }) {
  const dispatch = useDispatch();
  const showSuccess = (message) => {
    dispatch(showSuccessNotification(message));
  };

  const restoreIssue = () => {
    const onSuccess = () => showSuccess(`Issue ${issueId} restored successfully.`);
    dispatch(issueRestore(issueId, onSuccess));
  };

  return (
    <span>
      {`Deleted issue ${issueId} successfully.`}
      <Button bsStyle="link" onClick={restoreIssue}>
        UNDO
      </Button>
    </span>
  );
}

dynamicComponents.IssueRestore = IssueRestore;
