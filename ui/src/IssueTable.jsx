import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';

export default function IssueTable(props) {
  const { issues, closeIssue } = props;

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
        {issues.map(issue => <IssueRow key={issue.id} issue={issue} closeIssue={closeIssue} />)}
      </tbody>
    </table>
  );
}

const IssueRow = withRouter(({
  issue,
  location: { search },
  closeIssue,
}) => {
  const selectLocation = { pathname: `/issues/${issue.id}`, search };

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
        <button type="button" onClick={() => { closeIssue(issue.id); }} disabled={issue.status === 'Closed'}>Close</button>
      </td>
    </tr>
  );
});
