import URLSearchParams from 'url-search-params';
import React from 'react';

import graphQLFetch from './graphQLFetch.js';
import IssueAdd from './IssueAdd.jsx';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.loadData();
    }
  }

  async loadData() {
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);

    const vars = {};
    if (params.get('status')) vars.status = params.get('status');

    const query = `
      query IssueList($status: StatusType){
        issuesList(status: $status) {
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

    const data = await graphQLFetch(query, vars);
    if (data) this.setState({ issues: data.issuesList });
  }

  async createIssue(issue) {
    const query = `
      mutation addIssue($issue: IssueInputs!) {
        addIssue(issue: $issue) {
          id
        }
      }
    `;

    const data = await graphQLFetch(query, { issue });
    if (data) this.loadData();
  }

  render() {
    const { issues } = this.state;

    return (
      <React.Fragment>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={issues} />
        <hr />
        <IssueAdd createIssue={this.createIssue} />
      </React.Fragment>
    );
  }
}
