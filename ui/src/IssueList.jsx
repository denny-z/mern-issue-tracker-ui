import URLSearchParams from 'url-search-params';
import React from 'react';
import { Panel } from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import Toast from './Toast.jsx';
import store from './store.js';

export default class IssueList extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };

    if (params.get('status')) vars.status = params.get('status');

    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

    const { params: { id } } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }

    const query = `
      query IssueList(
        $status: StatusType,
        $effortMin: Int,
        $effortMax: Int,
        $hasSelection: Boolean!,
        $selectedId: Int!,
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
        
        issue(id: $selectedId) @include (if: $hasSelection) {
          id 
          description
        }
      }
    `;

    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor() {
    super();
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);

    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);

    const issues = store.initialData ? store.initialData.issuesList : null;
    const selectedIssue = store.initialData ? store.initialData.issue : null;
    delete store.initialData;

    this.state = {
      issues,
      selectedIssue,
      toastVisible: false,
      toastMessage: ' ',
      toastType: 'info',
    };
  }

  componentDidMount() {
    const { issues } = this.state;
    if (issues == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
      match: { params: { id: prevId } },
    } = prevProps;
    const { location: { search }, match: { params: { id } } } = this.props;

    const isSearchChanged = prevSearch !== search;
    const isIdChanged = prevId !== id;

    if (isSearchChanged && isIdChanged) {
      this.loadData();
      return;
    }

    if (isIdChanged) {
      this.loadSelectedIssue();
    }
  }

  async loadData() {
    const { match, location: { search } } = this.props;
    const data = await IssueList.fetchData(match, search, this.showError);
    if (data) this.setState({ issues: data.issuesList, selectedIssue: data.issue });
  }

  // This function should be used when only selected issue. It will help to reduce
  // network trafic if use loadData, because it fetches issuesList too.
  async loadSelectedIssue() {
    const query = `
      query SelectedIssue($id: Int!) {
        issue(id: $id) {
          id description
        }
      }
    `;
    const { match: { params: { id } } } = this.props;
    const vars = { id };

    const data = await graphQLFetch(query, vars, this.showError);
    if (data) this.setState({ selectedIssue: data.issue });
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
    if (issues == null) return null;

    const { location } = this.props;
    const hasFilter = location.search !== '';

    const { selectedIssue } = this.state;

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
        <IssueDetail issue={selectedIssue} />

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
