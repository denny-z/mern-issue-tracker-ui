export default function IssueTable(props) {
  const { issues } = props;

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
        </tr>
      </thead>
      <tbody>
        {issues.map(issue => <IssueRow key={issue.id} issue={issue} />)}
      </tbody>
    </table>
  );
}

function IssueRow(props) {
  const { issue } = props;

  return (
    <tr>
      <td>{issue.id}</td>
      <td>{issue.status}</td>
      <td>{issue.owner}</td>
      <td>{issue.created.toDateString()}</td>
      <td>{issue.effort}</td>
      <td>{issue.due ? issue.due.toDateString() : ' '}</td>
      <td>{issue.title}</td>
    </tr>
  );
}