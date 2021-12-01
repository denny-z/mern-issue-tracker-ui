import { combineReducers } from 'redux';
import {
  ISSUES_LIST_LOADED, ISSUE_PREVIEW_LOADED, STATS_CLEAR, STATS_LOADED,
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
    case ISSUES_LIST_LOADED:
      return {
        issues: p.issuesList.issues,
        selectedIssue: p.issue,
        totalPages: p.issuesList.pages,
        isLoaded: true,
      };
    case ISSUE_PREVIEW_LOADED:
      return {
        ...state,
        selectedIssue: p.issue,
      };
    default: return state;
  }
}

export default combineReducers({
  issueCounts: statsReducer,
  issuesList: issuesReducer,
});
