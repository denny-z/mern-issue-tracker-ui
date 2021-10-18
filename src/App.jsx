class IssueFilter extends React.Component {
  render() {
    return (
      <div>Placeholder for issue filter.</div>
    );
  }
}

function IssueTable(props) {
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
        { props.issues.map((issue) => <IssueRow key={ issue.id } issue={ issue }></IssueRow>) }
      </tbody>
    </table>
  );
}

function IssueRow(props) {
  const issue = props.issue;

  return (
    <tr>
      <td>{ issue.id }</td>
      <td>{ issue.status }</td>
      <td>{ issue.owner }</td>
      <td>{ issue.created.toDateString() }</td>
      <td>{ issue.effort }</td>
      <td>{ issue.due ? issue.due.toDateString() : ' ' }</td>
      <td>{ issue.title }</td>
    </tr>
  )
}

class IssueAdd extends React.Component {
  static DAYS_10 = 1000 * 60 * 60 * 24 * 10;

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      due: new Date(new Date().getTime() + IssueAdd.DAYS_10),
    };
    this.props.createIssue(issue);
    form.owner.value = '';
    form.title.value = '';
  }

  render() {
    return (
      <form onSubmit={ this.handleSubmit }>
        <input type="text" name="owner" id="new-issue-owner" />
        <input type="text" name="title" id="new-issue-title" />
        <button>Add</button>
      </form>
    );
  }
}

const dateRegexp = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReciever(key, value) {
  if (dateRegexp.test(value)) return new Date(value);
  return value;
}

class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `
      query {
        issuesList {
          id
          title
          owner
          status
          created
          effort
          due
        }
      }
    `;

    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const textResult = await response.text();
    const result = JSON.parse(textResult, jsonDateReciever);

    this.setState({ issues: result.data.issuesList });
  }

  async createIssue(issue) {
    const query = `
      mutation addIssue($issue: IssueInputs!) {
        addIssue(issue: $issue) {
          id
        }
      }
    `;

    await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { issue } }),
    })

    this.loadData();
  }

  render() {
    return (
      <React.Fragment>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={ this.state.issues } />
        <hr />
        <IssueAdd createIssue={ this.createIssue } />
      </React.Fragment>
    );
  }
}

ReactDOM.render(<IssueList />, document.getElementById('content'));
