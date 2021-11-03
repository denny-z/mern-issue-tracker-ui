import URLSearchParams from 'url-search-params';
import React from 'react';
import { Route } from 'react-router-dom';
import { Label } from 'react-bootstrap';

import graphQLFetch from './graphQLFetch.js';
import IssueAdd from './IssueAdd.jsx';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
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

    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

    const query = `
      query IssueList(
        $status: StatusType,
        $effortMin: Int,
        $effortMax: Int
      ){
        issuesList(
          status: $status,
          effortMin: $effortMin,
          effortMax: $effortMax
        ) {
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

  async closeIssue(id) {
    const query = `
      mutation CloseIssue($id: Int!) {
        updateIssue(id: $id, changes: { status: Closed }) {
          id
          title
          status
          owner
          effort
          created
          due
          description
        }
      }
    `;

    const data = await graphQLFetch(query, { id });
    if (data) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        const issueIndex = newList.findIndex(issue => issue.id === id);
        if (issueIndex === -1) {
          // eslint-disable-next-line no-alert
          alert(`Looks like the list in not in sync. Was not able to find issue ID ${id}. Refreshing list...`);
          this.loadData();
          return { issues: [] };
        }
        newList[issueIndex] = data.updateIssue;
        return { issues: newList };
      });
    } else {
      this.loadData();
    }
  }

  async deleteIssue(id) {
    const query = `
      mutation DeleteIssue($id: Int!) {
        deleteIssue(id: $id)
      }
    `;
    const data = await graphQLFetch(query, { id });
    if (data && data.deleteIssue) {
      this.setState(prevState => ({ issues: prevState.issues.filter(issue => issue.id !== id) }));

      const { location: { pathname, search }, history } = this.props;
      if (pathname === `/issues/${id}`) {
        history.push({ pathname: '/issues', search });
      }
    } else {
      this.loadData();
    }
  }

  render() {
    const { issues } = this.state;
    const { match } = this.props;

    return (
      <React.Fragment>
        <h1><Label>Issue Tracker</Label></h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={issues} closeIssue={this.closeIssue} deleteIssue={this.deleteIssue} />
        <hr />
        <IssueAdd createIssue={this.createIssue} />
        <hr />
        <Route path={`${match.path}/:id`} component={IssueDetail} />
      </React.Fragment>
    );
  }
}
