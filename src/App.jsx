const initialIssues = [
  {
    id: 1,
    status: 'New',
    owner: 'Ravan',
    effort: 5,
    created: new Date('2018-08-15'),
    due: undefined,
    title: 'Error in console when clicking Add',
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    effort: 14,
    created: new Date('2018-08-16'), due: new Date('2018-08-30'),
    title: 'Missing bottom border on panel',
  }
];

class IssueFilter extends React.Component {
  render() {
    return (
      <div>Placeholder for issue filter.</div>
    );
  }
}

class IssueTable extends React.Component {
  render() {
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
          { this.props.issues.map((issue) => <IssueRow key={ issue.id } issue={ issue }></IssueRow>) }
        </tbody>
      </table>
    );
  }
}

class IssueRow extends React.Component {
  render() {
    const issue = this.props.issue;

    return (
      <tr>
        <td>{ issue.id }</td>
        <td>{ issue.status }</td>
        <td>{ issue.owner }</td>
        <td>{ issue.created.toDateString() }</td>
        <td>{ issue.effort }</td>
        <td>{ issue.due ? issue.due.toDateString() : '' }</td>
        <td>{ issue.title }</td>
      </tr>
    )
  }
}

class IssueAdd extends React.Component {
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
      status: 'New',
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

class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      this.setState({ issues: initialIssues });
    }, 500);
  }

  createIssue(issue) {
    issue.id = this.state.issues.length + 1;
    issue.created = new Date();
    const newIssues = this.state.issues.slice();
    newIssues.push(issue);
    this.setState({ issues: newIssues });
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
