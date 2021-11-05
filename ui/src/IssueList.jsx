import URLSearchParams from 'url-search-params';
import React from 'react';
import { Route } from 'react-router-dom';
import { Panel } from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import Toast from './Toast.jsx';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);

    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);

    this.state = {
      issues: [],
      toastVisible: false,
      toastMessage: ' ',
      toastType: 'info',
    };
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

    const data = await graphQLFetch(query, vars, this.showError);
    if (data) this.setState({ issues: data.issuesList });
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

    const data = await graphQLFetch(query, { id }, this.showError);
    if (data) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        const issueIndex = newList.findIndex(issue => issue.id === id);
        if (issueIndex === -1) {
          this.showError(`Looks like the list in not in sync. Was not able to find issue ID ${id}. Refreshing list...`);
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
    const data = await graphQLFetch(query, { id }, this.showError);
    this.showSuccess(`Deleted issue ${id} successfully.`);

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

  showSuccess(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({
      toastVisible: false,
    });
  }

  render() {
    const { issues } = this.state;
    const { match, location } = this.props;
    const hasFilter = location.search !== '';

    const { toastVisible, toastType, toastMessage } = this.state;

    return (
      <React.Fragment>
        <Panel defaultExpanded={hasFilter}>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter />
          </Panel.Body>
        </Panel>
        <IssueTable issues={issues} closeIssue={this.closeIssue} deleteIssue={this.deleteIssue} />
        <Route path={`${match.path}/:id`} component={IssueDetail} />

        <Toast
          needToShow={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}
