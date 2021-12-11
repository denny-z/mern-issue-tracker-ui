import React from 'react';
import { useSelector } from 'react-redux';
import { getSelectedIssue, getSelectedIssueLoading } from './redux/selectors.js';

export default function IssueDetail() {
  const issue = useSelector(getSelectedIssue);
  const isLoading = useSelector(getSelectedIssueLoading);

  if (isLoading) return (<h3>Descrpition is loading...</h3>);
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
