import URLSearchParams from 'url-search-params';
import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import withToast from './withToast.jsx';
import store from './store.js';
import prepareIssueFilterVars from './prepareIssueFilterVars.js';
import PagintationWithSections from './PaginationWithSections.jsx';

class IssueList extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    Object.assign(vars, prepareIssueFilterVars(params));

    const { params: { id } } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }
    let page = params.get('page', 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    const query = `
      query IssueList(
        $status: StatusType,
        $effortMin: Int,
        $effortMax: Int,
        $hasSelection: Boolean!,
        $selectedId: Int!,
        $page: Int
      ){
        issuesList(
          status: $status
          effortMin: $effortMin
          effortMax: $effortMax
          page: $page
        ) {
          issues { 
            id
            title
            owner
            status
            created
            effort
            due
          }
          pages
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
    this.restoreIssue = this.restoreIssue.bind(this);

    const initialData = store.initialData || { issuesList: {} };
    const {
      issuesList: { issues, pages: totalPages }, issue: selectedIssue,
    } = initialData;
    delete store.initialData;

    this.state = {
      issues,
      selectedIssue,
      totalPages,
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

    if (!isIdChanged && !isSearchChanged) return;

    if (isIdChanged && !isSearchChanged) {
      this.loadSelectedIssue();
      return;
    }

    this.loadData();
  }

  async loadData() {
    const { match, location: { search }, showError } = this.props;
    const data = await IssueList.fetchData(match, search, showError);
    if (data) {
      this.setState({
        issues: data.issuesList.issues,
        totalPages: data.issuesList.pages,
        selectedIssue: data.issue,
      });
    }
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
    const { match: { params: { id } }, showError } = this.props;
    const vars = { id };

    const data = await graphQLFetch(query, vars, showError);
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

    const { showError } = this.props;
    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        const issueIndex = newList.findIndex(issue => issue.id === id);
        if (issueIndex === -1) {
          showError(`Looks like the list in not in sync. Was not able to find issue ID ${id}. Refreshing list...`);
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
    const { showError, showSuccess } = this.props;
    const query = `
      mutation DeleteIssue($id: Int!) {
        deleteIssue(id: $id)
      }
    `;
    const data = await graphQLFetch(query, { id }, showError);
    const undoMessage = (
      <span>
        {`Deleted issue ${id} successfully.`}
        <Button bsStyle="link" onClick={() => this.restoreIssue(id)}>
          UNDO
        </Button>
      </span>
    );

    if (data && data.deleteIssue) {
      this.setState(prevState => ({ issues: prevState.issues.filter(issue => issue.id !== id) }));

      const { location: { pathname, search }, history } = this.props;
      if (pathname === `/issues/${id}`) {
        history.push({ pathname: '/issues', search });
      }

      showSuccess(undoMessage);
    } else {
      this.loadData();
    }
  }

  async restoreIssue(id) {
    const query = `mutation RestoreIssue($id: Int!) {
      issueRestore(id: $id)
    }`;
    const { showError, showSuccess } = this.props;
    const data = await graphQLFetch(query, { id }, showError);
    if (data && data.issueRestore) {
      showSuccess(`Issue ${id} restored successfully.`);
      this.loadData();
    }
  }

  render() {
    const { issues } = this.state;
    if (issues == null) return null;

    const { location: { search } } = this.props;
    const hasFilter = search !== '';

    const { selectedIssue, totalPages } = this.state;

    return (
      <React.Fragment>
        <Panel defaultExpanded={hasFilter}>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter urlBase="/issues" />
          </Panel.Body>
        </Panel>
        <IssueTable issues={issues} closeIssue={this.closeIssue} deleteIssue={this.deleteIssue} />
        <IssueDetail issue={selectedIssue} />
        <PagintationWithSections search={search} totalPages={totalPages} />
      </React.Fragment>
    );
  }
}

const IssueListWithToast = withToast(IssueList);
IssueListWithToast.fetchData = IssueList.fetchData;
export default IssueListWithToast;
