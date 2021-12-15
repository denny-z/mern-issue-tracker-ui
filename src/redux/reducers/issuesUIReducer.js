import {
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUE_DELETED,
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
  loadingIds: {},
};

export default function issuesUIReducer(state = issuesInitialState, { payload: p, type }) {
  switch (type) {
    case ISSUES_LIST_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case ISSUES_LIST_CACHE_HIT:
      return {
        ...state,
        isLoading: false,
        currentQueryParams: p.meta.currentQueryParams,
      };
    case ISSUES_LIST_LOADED: {
      const payloadIssues = p.issuesList.issues;
      const { currentQueryParams } = p.meta;
      const queryToIssueIds = state.queryToIssueIds || {};
      queryToIssueIds[currentQueryParams] = payloadIssues.map(i => i.id);

      return {
        ...state,
        queryToIssueIds,
        totalPages: p.issuesList.pages,
        isLoading: false,
        currentQueryParams,
      };
    }
    case ISSUE_RESTORED:
    case ISSUE_CREATED: {
      // TODO: [react-redux] invalidate cache for last pages. [issues-reducer]
      return state;
    }
    case ISSUE_LOADING: {
      const loadingIds = { ...state.loadingIds };
      loadingIds[p.id] = true;

      return {
        ...state,
        loadingIds,
      };
    }
    case ISSUE_CACHE_HIT: {
      const loadingIds = { ...state.loadingIds };
      loadingIds[p.id] = false;

      return {
        ...state,
        loadingIds,
      };
    }
    case ISSUE_LOADED: {
      const loadedIssue = p.issue;
      const loadingIds = { ...state.loadingIds };
      loadingIds[loadedIssue.id] = false;

      return {
        ...state,
        loadingIds,
      };
    }
    case ISSUE_UPDATED: {
      const newIssue = p.issueUpdate;
      const loadingIds = { ...state.loadingIds };
      loadingIds[newIssue.id] = false;

      return {
        ...state,
        loadingIds,
      };
    }
    case ISSUE_DELETED: {
      const loadingIds = { ...state.loadingIds };
      delete loadingIds[p.id];

      const queryToIssueIds = { ...state.queryToIssueIds };
      Object.entries(queryToIssueIds).forEach(([key, ids]) => {
        const index = ids.indexOf(p.id);
        if (index !== -1) {
          ids.splice(index, 1);
          queryToIssueIds[key] = [...ids];
        }
      });

      return {
        ...state,
        loadingIds,
        queryToIssueIds,
      };
    }
    default: return state;
  }
}
