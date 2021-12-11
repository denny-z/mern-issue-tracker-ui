import {
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUE_DELETED,
  ISSUE_SELECTED,
  ISSUE_LOADED,
  ISSUE_RESTORED,
  ISSUE_UPDATED,
  ISSUE_CREATED,
  ISSUES_LIST_CACHE_HIT,
  ISSUE_LOADING,
  ISSUE_CACHE_HIT,
} from '../types.js';

const issuesInitialState = {
  queryToIssueIds: {},
  issues: [],
};

export default function issuesReducer(state = issuesInitialState, action) {
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
    // TODO [react-redux]: Fix totalPages and pages size does not change on ISSUE_DELETE.
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
    case ISSUE_LOADING: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case ISSUE_CACHE_HIT: {
      return {
        ...state,
        isLoading: false,
      };
    }
    case ISSUE_LOADED: {
      const newIssues = [...state.issues];
      const loadedIssue = p.issue;
      const issueIndex = newIssues.findIndex(issue => issue.id === loadedIssue.id);
      if (issueIndex !== -1) {
        Object.assign(newIssues[issueIndex], loadedIssue);
        newIssues[issueIndex] = { ...newIssues[issueIndex] };
      } else {
        newIssues.push(loadedIssue);
      }

      return {
        ...state,
        issues: newIssues,
        isLoading: false,
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
