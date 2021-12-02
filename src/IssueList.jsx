import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import withToast from './withToast.jsx';
import PagintationWithSections from './PaginationWithSections.jsx';
import { loadIssuePreview, loadIssues } from './redux/actions.js';

class IssueList extends React.Component {
  static async fetchData(match, search, showError) {
    return loadIssues(match, search, showError);
  }

  constructor() {
    super();
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.restoreIssue = this.restoreIssue.bind(this);
  }

  // INFO: Store will identify whether need to reload data if needed.
  componentDidMount() {
    this.loadData();
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
    const {
      match, location: { search },
      showError,
      dispatch,
    } = this.props;

    dispatch(loadIssues(match, search, showError));
  }

  // INFO: This function should be used when only selected issue. It will help to reduce
  // network trafic if use loadData, because it fetches issuesList too.
  async loadSelectedIssue() {
    const {
      match: { params: { id } },
      showError,
      dispatch,
    } = this.props;

    dispatch(loadIssuePreview(id, showError));
  }

  // TODO: [react-redux] fix it.
  // Use dispatch instead of this.setState. Handle "closed" status change in reducer.
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
    const { issues, isLoaded } = this.props;
    if (!isLoaded) return null;

    const { location: { search } } = this.props;
    const hasFilter = search !== '';

    const { selectedIssue, totalPages } = this.props;

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

const mapStateToProps = ({ issuesList }) => ({
  totalPages: issuesList.totalPages,
  issues: issuesList.issues,
  selectedIssue: issuesList.selectedIssue,
  isLoaded: issuesList.isLoaded,
});
const Connected = connect(mapStateToProps, null)(IssueList);
const WithToast = withToast(Connected);
WithToast.fetchData = IssueList.fetchData;
export default WithToast;
