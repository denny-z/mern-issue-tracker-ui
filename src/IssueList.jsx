import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import withToast from './withToast.jsx';
import PagintationWithSections from './PaginationWithSections.jsx';
import {
  issueClose, issueDelete, issueRestore, loadIssuePreview, loadIssues,
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

    if (!Number.isNaN(parseInt(id, 10)) && isIdChanged && !isSearchChanged) {
      this.loadSelectedIssue();
      return;
    }

    this.loadData();
  }

  // INFO: Store will identify whether need to reload data if needed.
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

    dispatch(loadIssuePreview(parseInt(id, 10), showError));
  }

  async closeIssue(id) {
    const { showError, dispatch } = this.props;
    dispatch(issueClose(id, showError));
  }

  async deleteIssue(id) {
    const { showError, showSuccess, dispatch } = this.props;

    const onSuccess = () => {
      const undoMessage = (
        <span>
          {`Deleted issue ${id} successfully.`}
          <Button bsStyle="link" onClick={() => this.restoreIssue(id)}>
            UNDO
          </Button>
        </span>
      );
      showSuccess(undoMessage);

      const { history, location: { pathname, search } } = this.props;
      if (pathname === `/issues/${id}`) {
        history.push({ pathname: '/issues', search });
      }
    };

    dispatch(issueDelete(id, showError, onSuccess));
    // TODO: [react-redux] fix it.
    // Handle case when server side returned data.deletedIssue === false.
  }

  restoreIssue(id) {
    const { showError, showSuccess, dispatch } = this.props;
    const showSuccessWithMessage = () => showSuccess(`Issue ${id} restored successfully.`);
    dispatch(issueRestore(id, showError, showSuccessWithMessage));
  }

  render() {
    const { isLoaded } = this.props;

    // TODO: [ui-features] fix flicking while issues are loading.
    // Show spinner on top of current table with issues.
    // TODO: [ui-features] fix jumping of pages when no there are no or <10 issues loaded.
    if (!isLoaded) {
      return (
        <h2 className="text-center">Loading...</h2>
      );
    }

    const { location: { search } } = this.props;
    const hasFilter = search !== '';

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
        {/* TODO: [react-redux] [move-methods] Move issue actions from IssueList to IssueRow. */}
        <IssueTable closeIssue={this.closeIssue} deleteIssue={this.deleteIssue} />
        <IssueDetail />
        <PagintationWithSections search={search} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isLoaded: state.issues.isLoaded,
});
const Connected = connect(mapStateToProps, null)(IssueList);
const WithToast = withToast(Connected);
WithToast.fetchData = IssueList.fetchData;
export default WithToast;
