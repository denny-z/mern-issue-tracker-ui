import { ActionCreators } from 'redux-undo';
import {
  issueLoadQueryBuilder,
  ISSUE_CLOSE_QUERY,
  ISSUE_CREATE_QUERY,
  ISSUE_DELETE_QUERY,
  ISSUE_LIST_QUERY,
  ISSUE_PREVIEW_QUERY,
  ISSUE_REPORT_QUERY,
  ISSUE_RESTORE_QUERY,
  ISSUE_UPDATE_QUERY,
} from '../api/issue_queries.js';
import { ISSUE_FIELDS } from '../constants.js';
import { generateCacheIdentity, prepareIssueFilterVars, prepareListVars } from '../filterUtils.js';
import graphQLFetch, { formatErrorToMessage, tryGraphQLFetch } from '../graphQLFetch.js';
import { getFieldsListDiff } from '../utils/objectUtils.js';
import {
  getCacheIdentities,
  getFilterData,
  getIssue,
  getIssueLoading,
  getSelectedIssue,
  getJumpToDeletedActionIndex,
  isCurrentIssuePageNeedsLoad,
} from './selectors.js';
import {
  STATS_CLEAR,
  STATS_LOADED,
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUES_LIST_CACHE_HIT,
  ISSUE_LOADED,
  ISSUE_UPDATED,
  ISSUE_DELETED,
  ISSUE_SELECTED,
  ISSUE_CREATED,
  ISSUE_LOADING,
  ISSUE_CACHE_HIT,
  ISSUES_LIST_CACHE_RESET,
  ERROR_GENERAL,
  STATS_LOAD_ERROR,
  ERROR_HIDE,
} from './types.js';

export function hideError() {
  return {
    type: ERROR_HIDE,
  };
}

function onError(errorMessage, type = ERROR_GENERAL) {
  return (dispatch) => {
    dispatch({
      type,
      error: { errorMessage },
    });
  };
}

export function loadStats(match, search) {
  return async (dispatch) => {
    try {
      const params = new URLSearchParams(search);
      const vars = prepareIssueFilterVars(params);
      const result = await tryGraphQLFetch(ISSUE_REPORT_QUERY, vars);

      if (result.errors == null) {
        dispatch({
          type: STATS_LOADED,
          payload: result.data,
        });
      } else {
        const errorMessage = formatErrorToMessage(result.errors[0]);
        dispatch(onError(errorMessage, STATS_LOAD_ERROR));
      }
    } catch (e) {
      dispatch(onError(e.message, STATS_LOAD_ERROR));
    }
  };
}

export function clearStats() {
  return {
    type: STATS_CLEAR,
  };
}

function loadIssuesByVars(queryVars, currentCacheIdentity, showError) {
  return async (dispatch) => {
    const data = await graphQLFetch(ISSUE_LIST_QUERY, queryVars, showError);
    dispatch({
      type: ISSUES_LIST_LOADED,
      payload: Object.assign(
        data,
        { meta: { currentCacheIdentity, currentListVars: queryVars } },
      ),
    });
  };
}

function reloadCurrentPageIfNeeded(dispatch, getState, showError) {
  // INFO: This check for current page reload might help when Live Editing comes.
  if (isCurrentIssuePageNeedsLoad(getState())) {
    dispatch({ type: ISSUES_LIST_LOADING });

    const [currentListVars, currentCacheIdentity] = getFilterData(getState());
    dispatch(
      loadIssuesByVars(currentListVars, currentCacheIdentity, showError),
    );
  }
}

function clearIssuesCache(dispatch, getState, id, showError, changedKeys = []) {
  dispatch({
    type: ISSUES_LIST_CACHE_RESET,
    payload: { id, changedKeys },
  });

  reloadCurrentPageIfNeeded(dispatch, getState, showError);
}

export function initLoadIssues(match, search, showError) {
  return (dispatch, getState) => {
    const vars = prepareListVars(match, search);
    const currentCacheIdentity = generateCacheIdentity(match, search);
    const identityToIssueIds = getCacheIdentities(getState());

    if (identityToIssueIds[currentCacheIdentity]) {
      dispatch({
        type: ISSUES_LIST_CACHE_HIT,
        payload: { meta: { currentCacheIdentity, currentListVars: vars } },
      });
      return;
    }

    dispatch({ type: ISSUES_LIST_LOADING });
    dispatch(loadIssuesByVars(vars, currentCacheIdentity, showError));
  };
}

export function loadIssuePreview(id, showError) {
  return async (dispatch, getState) => {
    const vars = { id };
    dispatch({ type: ISSUE_SELECTED, payload: vars });

    if (getIssueLoading(getState(), id)) {
      return;
    }

    const loadingTimeout = setTimeout(() => {
      dispatch({ type: ISSUE_LOADING, payload: vars });
    }, 600);

    // INFO: This is a cache field loaded by preview.
    const selectedIssue = getSelectedIssue(getState());
    if (selectedIssue && 'description' in selectedIssue) {
      dispatch({ type: ISSUE_CACHE_HIT, payload: vars });
      clearTimeout(loadingTimeout);
      return;
    }

    const data = await graphQLFetch(ISSUE_PREVIEW_QUERY, vars, showError);

    dispatch({
      type: ISSUE_LOADED,
      payload: data,
    });
    clearTimeout(loadingTimeout);
  };
}

export function loadIssue(id, showError, onSuccess = (() => {})) {
  return async (dispatch, getState) => {
    dispatch({ type: ISSUE_LOADING, payload: { id } });

    const issue = getIssue(getState(), id);

    let fieldsToLoad;
    if (issue) {
      fieldsToLoad = ISSUE_FIELDS.filter(fieldName => fieldName === 'id' || !(fieldName in issue));
    } else {
      fieldsToLoad = ISSUE_FIELDS;
    }

    if (fieldsToLoad.length === 1 && fieldsToLoad[0] === 'id') {
      dispatch({ type: ISSUE_CACHE_HIT, payload: { id } });
      onSuccess();
      return;
    }
    const query = issueLoadQueryBuilder(fieldsToLoad);
    const data = await graphQLFetch(query, { id }, showError);

    dispatch({
      type: ISSUE_LOADED,
      payload: data,
    });
    onSuccess();
  };
}

export function updateIssue(issue, showError, onSuccess) {
  return async (dispatch, getState) => {
    const { id, created, ...changes } = issue;
    const issueBeforeUpdate = getIssue(getState(), id);

    dispatch({ type: ISSUE_LOADING, payload: { id } });

    const data = await graphQLFetch(ISSUE_UPDATE_QUERY, { id, changes }, showError);

    dispatch({
      type: ISSUE_UPDATED,
      payload: data,
    });
    onSuccess();

    // IDEA: These side affects tracking can be a good exercise for saga (redux-saga).
    const issueAfterUpdate = getIssue(getState(), id);
    const changedKeys = getFieldsListDiff(issueBeforeUpdate, issueAfterUpdate);

    clearIssuesCache(dispatch, getState, id, showError, changedKeys);
  };
}

// TODO: [react-redux] fix it.
// Handle error when issue by id is not found as it was implemented before redux add.
export function issueClose(id, showError) {
  return async (dispatch, getState) => {
    const vars = { id };
    const issueBeforeUpdate = getIssue(getState(), id);
    dispatch({ type: ISSUE_LOADING, payload: vars });

    const data = await graphQLFetch(ISSUE_CLOSE_QUERY, vars, showError);

    dispatch({
      type: ISSUE_UPDATED,
      payload: data,
    });

    // IDEA: These side affects tracking can be a good exercise for saga (redux-saga).
    const issueAfterUpdate = getIssue(getState(), id);
    const changedKeys = getFieldsListDiff(issueBeforeUpdate, issueAfterUpdate);

    clearIssuesCache(dispatch, getState, id, showError, changedKeys);
  };
}

// TODO: [react-redux] fix it. Handle when issue is not found in state.all.
// TODO: [react-redux] fix LOW bug. Total pages count does not refresh on prev page
//   when last issue from the current page.
// IDEA: [react-redux] Trigger page reload when the last issue in state.all deleted.
export function issueDelete(id, showError, onSuccess) {
  return async (dispatch, getState) => {
    const vars = { id };
    dispatch({ type: ISSUE_LOADING, payload: vars });
    const data = await graphQLFetch(ISSUE_DELETE_QUERY, vars, showError);

    if (data && data.deleteIssue) {
      dispatch({
        type: ISSUE_DELETED,
        payload: vars,
      });
      onSuccess();

      clearIssuesCache(dispatch, getState, id, showError);
    }
  };
}

export function issueRestore(id, showError, onSuccess) {
  return async (dispatch, getState) => {
    const data = await graphQLFetch(ISSUE_RESTORE_QUERY, { id }, showError);

    if (data && data.issueRestore) {
      const index = getJumpToDeletedActionIndex(getState());
      dispatch(ActionCreators.jumpToPast(index));
      onSuccess();
    }
  };
}

export function issueCreate(issue, showError, onSuccess) {
  return async (dispatch, getState) => {
    const data = await graphQLFetch(ISSUE_CREATE_QUERY, { issue }, showError);

    if (data) {
      dispatch({
        type: ISSUE_CREATED,
        payload: data.addIssue,
      });
      onSuccess(data.addIssue);
      reloadCurrentPageIfNeeded(dispatch, getState, showError);
    }
  };
}
