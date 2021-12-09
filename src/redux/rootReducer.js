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
  ISSUES_LIST_CACHE_HIT,
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
    case ISSUES_LIST_CACHE_HIT:
      return {
        ...state,
        isLoaded: true,
        currentQueryParams: p.meta.currentQueryParams,
      };
    case ISSUES_LIST_LOADED: {
      // INFO: Cache issues payload starts.
      const newIssues = p.issuesList.issues;
      let issues;
      if (state.issues && state.issues.length) {
        issues = [...state.issues];
        newIssues.forEach((newIssue) => {
          const index = issues.findIndex(issue => issue.id === newIssue.id);
          if (index !== -1) {
            Object.assign(issues[index], newIssue);
          } else {
            issues.push(newIssue);
          }
        });
      } else {
        issues = newIssues;
      }

      const { currentQueryParams } = p.meta;
      const queryToIssueIds = state.queryToIssueIds || {};
      queryToIssueIds[currentQueryParams] = newIssues.map(i => i.id);
      // INFO: Cache issues payload ends.

      const selectedIssueId = p.issue && p.issue.id;

      if (selectedIssueId != null) {
        const foundIssueIndex = issues.findIndex(i => i.id === selectedIssueId);
        if (foundIssueIndex !== -1) {
          Object.assign(issues[foundIssueIndex], p.issue);
        }
      }

      return {
        ...state,
        issues,
        queryToIssueIds,
        selectedIssueId,
        totalPages: p.issuesList.pages,
        isLoaded: true,
        currentQueryParams,
      };
    }
    case ISSUE_SELECTED: {
      return {
        ...state,
        selectedIssueId: p.id,
      };
    }
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
