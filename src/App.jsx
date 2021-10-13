class IssueFilter extends React.Component {
  render() {
    return (
      <div>Placeholder for issue filter.</div>
    );
  }
}

class IssueRow extends React.Component {
  render() {
    const style = this.props.rowStyle;
    return (
      <tr>
        <td style={style}>{this.props.issueId}</td>
        <td style={style}>{this.props.issueTitle}</td>
      </tr>
    )
  }
}

class IssueTable extends React.Component {
  render() {
    const rowStyle = {border: "1px solid silver", padding: 4};

    return (
      <table style={{borderCollapse: "collapse"}}>
        <thead>
          <tr>
            <th style={rowStyle}>ID</th>
            <th style={rowStyle}>Title</th>
          </tr>
        </thead>
        <tbody>
          <IssueRow issueId={1} issueTitle="Error in conslole while clicking Add" rowStyle={rowStyle}></IssueRow>
          <IssueRow issueId={2} issueTitle="Missing bottom border on panel" rowStyle={rowStyle}></IssueRow>
        </tbody>
      </table>
    );
  }
}

class IssueAdd extends React.Component {
  render() {
    return (
      <div>Placeholder for issue add form.</div>
    );
  }
}

class IssueList extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable />
        <hr />
        <IssueAdd />
      </React.Fragment>
    );
  }
}

ReactDOM.render(<IssueList />, document.getElementById('content'));
