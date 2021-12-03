import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import graphQLFetch from './graphQLFetch.js';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import withToast from './withToast.jsx';
import PagintationWithSections from './PaginationWithSections.jsx';
import {
  issueClose, issueDelete, loadIssuePreview, loadIssues,
} from './redux/actions.js';

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

  async closeIssue(id) {
    const { showError, dispatch } = this.props;
    dispatch(issueClose(id, showError));
  }

  async deleteIssue(id) {
    const { showError, showSuccess, dispatch } = this.props;

    // TODO: [react-redux] fix it.
    // Move restoreIssue functionality to action creator, handle action in reducer.
    const undoMessage = (
      <span>
        {`Deleted issue ${id} successfully.`}
        <Button bsStyle="link" onClick={() => this.restoreIssue(id)}>
          UNDO
        </Button>
      </span>
    );

    const showSuccessWithMessage = () => {
      showSuccess(undoMessage);
    };

    dispatch(issueDelete(id, showError, showSuccessWithMessage));

    // TODO: [react-redux] fix it.
    // Handle unselect of issue preview in reducer.
    // This piece of code was in use before redux added.
    // if (pathname === `/issues/${id}`) {
    //   history.push({ pathname: '/issues', search });
    // }

    // TODO: [react-redux] fix it.
    // Handle case when server side returned data.deletedIssue === false.
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
