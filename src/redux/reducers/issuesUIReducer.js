import { getRelatedIdentities } from '../../filterUtils.js';
import {
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUE_DELETED,
  ISSUE_LOADED,
  ISSUE_UPDATED,
  ISSUE_CREATED,
  ISSUES_LIST_CACHE_HIT,
  ISSUE_LOADING,
  ISSUE_CACHE_HIT,
  ISSUES_LIST_CACHE_RESET,
} from '../types.js';

const issuesInitialState = {
  identityToIssueIds: {},
  identityToPages: {},
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
        currentCacheIdentity: p.meta.currentCacheIdentity,
        currentListVars: p.meta.currentListVars,
      };
    case ISSUES_LIST_LOADED: {
      const payloadIssues = p.issuesList.issues;
      const { currentCacheIdentity, currentListVars } = p.meta;

      const identityToIssueIds = { ...state.identityToIssueIds };
      identityToIssueIds[currentCacheIdentity] = payloadIssues.map(i => i.id);

      const identityToPages = { ...state.identityToPages };
      identityToPages[currentCacheIdentity] = p.issuesList.pages;

      return {
        ...state,
        identityToIssueIds,
        isLoading: false,
        currentCacheIdentity,
        currentListVars,
        identityToPages,
      };
    }
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

      return {
        ...state,
        loadingIds,
      };
    }
    case ISSUES_LIST_CACHE_RESET: {
      const identityToIssueIds = { ...state.identityToIssueIds };

      const identities = getRelatedIdentities(identityToIssueIds, p.id, p.changedKeys);

      identities.forEach((identity) => { identityToIssueIds[identity] = null; });

      return {
        ...state,
        identityToIssueIds,
      };
    }
    default: return state;
  }
}
