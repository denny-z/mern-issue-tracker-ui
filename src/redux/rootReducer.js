import { combineReducers } from 'redux';
import {
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUE_DELETED,
  ISSUE_PREVIEW_LOADED,
  ISSUE_UPDATED,
  STATS_CLEAR,
  STATS_LOADED,
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
    case ISSUES_LIST_LOADED:
      return {
        issues: p.issuesList.issues,
        selectedIssue: p.issue,
        totalPages: p.issuesList.pages,
        isLoaded: true,
        currentQueryParams: p.meta.currentQueryParams,
      };
    case ISSUE_PREVIEW_LOADED:
      return {
        ...state,
        selectedIssue: p.issue,
      };
    // TODO: [react-redux] fix it. Handle when issue is not found in state.issues.
    case ISSUE_UPDATED: {
      const newIssues = [...state.issues];
      const newIssue = action.payload.updateIssue;
      const issueIndex = newIssues.findIndex(issue => issue.id === newIssue.id);
      newIssues.splice(issueIndex, 1, newIssue);

      return {
        ...state,
        issues: newIssues,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.issues.
    case ISSUE_DELETED: {
      const newIssues = state.issues.filter(issue => issue.id !== action.payload.id);
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
