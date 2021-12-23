import React from 'react';
import { Button, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import withToast from './withToast.jsx';
import PagintationWithSections from './PaginationWithSections.jsx';
import {
  issueClose, issueDelete, issueRestore, loadIssuePreview, initLoadIssues,
} from './redux/actions.js';
import { getCurrentIdentity, getIssueListIsError, getIssueListLoading } from './redux/selectors.js';

class IssueList extends React.Component {
  static async fetchData(match, search) {
    return initLoadIssues(match, search);
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
      pageIdentity: prevPageIdentity,
    } = prevProps;
    const {
      location: { search },
      match: { params: { id } },
      pageIdentity,
    } = this.props;

    const isSearchChanged = prevSearch !== search;
    const isIdChanged = prevId !== id;
    const isPageIdentityChanged = prevPageIdentity !== pageIdentity;

    if (isSearchChanged || isPageIdentityChanged) {
      this.loadData();
      return;
    }

    if (!Number.isNaN(parseInt(id, 10)) && isIdChanged) {
      this.loadSelectedIssue();
    }
  }

  // INFO: Store will identify whether need to reload data if needed.
  async loadData() {
    const {
      match, location: { search },
      dispatch,
    } = this.props;

    dispatch(initLoadIssues(match, search));
  }

  // INFO: This function should be used when only selected issue. It will help to reduce
  // network trafic if use loadData, because it fetches issuesList too.
  async loadSelectedIssue() {
    const {
      match: { params: { id } },
      dispatch,
    } = this.props;

    dispatch(loadIssuePreview(parseInt(id, 10)));
  }

  async closeIssue(id) {
    const { dispatch } = this.props;
    dispatch(issueClose(id));
  }

  async deleteIssue(id) {
    const { showSuccess, dispatch } = this.props;

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

    dispatch(issueDelete(id, onSuccess));
  }

  restoreIssue(id) {
    const { showSuccess, dispatch } = this.props;
    const showSuccessWithMessage = () => showSuccess(`Issue ${id} restored successfully.`);
    dispatch(issueRestore(id, showSuccessWithMessage));
  }

  render() {
    const { isLoading, isError } = this.props;

    // TODO: [ui-features] fix flicking while issues are loading.
    // Show spinner on top of current table with issues.
    // TODO: [ui-features] fix jumping of pages when no there are no or <10 issues loaded.
    if (isLoading) {
      return (
        <h2 className="text-center">Loading...</h2>
      );
    }

    if (isError) {
      return (
        <h2 className="text-center">Sorry, something went wrong...</h2>
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
  isLoading: getIssueListLoading(state),
  isError: getIssueListIsError(state),
  pageIdentity: getCurrentIdentity(state),
});
const Connected = connect(mapStateToProps, null)(IssueList);
const WithToast = withToast(Connected);
WithToast.fetchData = IssueList.fetchData;
export default WithToast;
