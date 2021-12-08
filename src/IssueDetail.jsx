import React from 'react';
import { useSelector } from 'react-redux';
import { getSelectedIssue } from './redux/selectors.js';

export default function IssueDetail() {
  const issue = useSelector(getSelectedIssue);

  if (issue == null) return null;

  const { id, description } = issue;

  return (
    <React.Fragment>
      <h3>Description</h3>
      (Issue ID:
      {` ${id}.)`}
      <br />
      <pre>{description || 'N/A'}</pre>
    </React.Fragment>
  );
}
