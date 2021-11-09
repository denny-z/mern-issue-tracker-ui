import React from 'react';

export default function IssueDetail({ issue }) {
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
