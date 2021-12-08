import { combineReducers } from 'redux';
import {
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUE_DELETED,
  ISSUE_SELECTED,
  ISSUE_LOADED,
  ISSUE_RESTORED,
  ISSUE_UPDATED,
  STATS_CLEAR,
  STATS_LOADED,
  ISSUE_CREATED,
} from './types.js';

function statsReducer(state = {}, action) {
  switch (action.type) {
    case STATS_LOADED:
      return { stats: action.payload.issueCounts, isLoaded: true };
    case STATS_CLEAR:
      return { stats: [], isLoaded: false };
    default: return state;
  }
}

function issuesReducer(state = {}, action) {
  const p = action.payload;

  switch (action.type) {
    case ISSUES_LIST_LOADING:
      return {
        ...state,
        isLoaded: false,
      };
    case ISSUES_LIST_LOADED: {
      const issues = [...p.issuesList.issues];
      const seelectedIssueId = p.issue && p.issue.id;
      if (seelectedIssueId != null) {
        const foundIssueIndex = issues.findIndex(i => i.id === seelectedIssueId);
        if (foundIssueIndex !== -1) {
          Object.assign(issues[foundIssueIndex], p.issue);
        }
      }

      return {
        issues,
        selectedIssueId: seelectedIssueId,
        totalPages: p.issuesList.pages,
        isLoaded: true,
        currentQueryParams: p.meta.currentQueryParams,
      };
    }
    case ISSUE_SELECTED: {
      return {
        ...state,
        selectedIssueId: p.id,
      };
    }
    // TODO: [react-redux] handle it somehow.
    // Currently, if user decides to come back (by arrow back browser button),
    // he will see a newly created issue, even it's not in the right order,
    // e.g. it should be on 10th page, but it shows on the last opened IssueList page.
    // This may be a good article to read, but needs RTK (Redux tool kit knowledge):
    //   https://redux-toolkit.js.org/rtk-query/usage/cache-behavior#default-cache-behavior
    // such as:
    //   https://redux.js.org/tutorials/essentials/part-1-overview-concepts
    case ISSUE_CREATED: {
      const newIssues = state.issues.concat([p]);
      return {
        ...state,
        issues: newIssues,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.issues.
    case ISSUE_LOADED: {
      const newIssues = [...state.issues];
      const issuePreview = p.issue;
      const issueIndex = newIssues.findIndex(issue => issue.id === issuePreview.id);
      if (issueIndex !== -1) {
        Object.assign(newIssues[issueIndex], issuePreview);
      }

      return {
        ...state,
        issues: newIssues,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.issues.
    case ISSUE_UPDATED: {
      const newIssues = [...state.issues];
      const newIssue = p.issueUpdate;
      const issueIndex = newIssues.findIndex(issue => issue.id === newIssue.id);
      newIssues.splice(issueIndex, 1, newIssue);

      return {
        ...state,
        issues: newIssues,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.issues.
    // IDEA: [react-redux] Trigger page reload when the last issue in state.issues deleted.
    case ISSUE_DELETED: {
      const newIssues = state.issues.filter(issue => issue.id !== p.id);

      let selectedId = state.selectedIssueId;
      if (state.selectedIssueId === p.id) {
        selectedId = null;
      }

      return {
        ...state,
        issues: newIssues,
        selectedIssueId: selectedId,
      };
    }
    case ISSUE_RESTORED: {
      const newIssues = state.issues.concat([p.issueRestore]);
      return {
        ...state,
        issues: newIssues,
      };
    }
    default: return state;
  }
}

export default combineReducers({
  issueCounts: statsReducer,
  issuesList: issuesReducer,
});
