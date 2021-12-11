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
  all: [],
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
      const payloadIssues = p.issuesList.issues;
      let newIssues;
      if (state.all && state.all.length) {
        newIssues = [...state.all];
        payloadIssues.forEach((newIssue) => {
          const index = newIssues.findIndex(issue => issue.id === newIssue.id);
          if (index !== -1) {
            Object.assign(newIssues[index], newIssue);
          } else {
            newIssues.push(newIssue);
          }
        });
      } else {
        newIssues = payloadIssues;
      }

      const { currentQueryParams } = p.meta;
      const queryToIssueIds = state.queryToIssueIds || {};
      queryToIssueIds[currentQueryParams] = payloadIssues.map(i => i.id);
      // INFO: Cache issues payload ends.

      const selectedIssueId = p.issue && p.issue.id;

      if (selectedIssueId != null) {
        const foundIssueIndex = newIssues.findIndex(i => i.id === selectedIssueId);
        if (foundIssueIndex !== -1) {
          Object.assign(newIssues[foundIssueIndex], p.issue);
        }
      }

      return {
        ...state,
        all: newIssues,
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
    case ISSUE_RESTORED:
    case ISSUE_CREATED: {
      const newIssues = state.all.concat([p]);
      return {
        ...state,
        all: newIssues,
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
      const newIssues = [...state.all];
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
        all: newIssues,
        isLoading: false,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.all.
    case ISSUE_UPDATED: {
      const newIssues = [...state.all];
      const newIssue = p.issueUpdate;
      const issueIndex = newIssues.findIndex(issue => issue.id === newIssue.id);
      newIssues.splice(issueIndex, 1, newIssue);

      return {
        ...state,
        all: newIssues,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.all.
    // IDEA: [react-redux] Trigger page reload when the last issue in state.all deleted.
    case ISSUE_DELETED: {
      const newIssues = state.all.filter(issue => issue.id !== p.id);

      let selectedId = state.selectedIssueId;
      if (state.selectedIssueId === p.id) {
        selectedId = null;
      }

      return {
        ...state,
        all: newIssues,
        selectedIssueId: selectedId,
      };
    }
    default: return state;
  }
}
