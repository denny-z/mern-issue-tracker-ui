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
import { formatErrorToMessage, tryGraphQLFetch } from '../graphQLFetch.js';
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
  HIDE_NOTIFICATION,
  ISSUES_LIST_LOAD_ERROR,
  ISSUE_LOAD_ERROR,
  ISSUE_UPDATE_ERROR,
  ISSUE_CREATE_ERROR,
  ISSUE_DELETE_ERROR,
  ISSUE_RESTORE_ERROR,
  SUCCESS_NOTIFICATION,
} from './types.js';

export function hideNotification() {
  return {
    type: HIDE_NOTIFICATION,
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

export function showSuccessNotification(message, type = SUCCESS_NOTIFICATION) {
  return {
    type,
    payload: { message },
  };
}

export function showSuccessNotificationComponent(componentName, componentProps, isError = false) {
  return {
    type: SUCCESS_NOTIFICATION,
    component: {
      name: componentName,
      props: componentProps,
    },
    payload: { isError },
  };
}

function handleApiError(result, dispatch, errorType, onSuccess) {
  if (result.errors == null) {
    onSuccess(result.data);
  } else {
    const errorMessage = formatErrorToMessage(result.errors[0]);
    dispatch(onError(errorMessage, errorType));
  }
}

export function loadStats(search) {
  return async (dispatch) => {
    try {
      const params = new URLSearchParams(search);
      const vars = prepareIssueFilterVars(params);
      const result = await tryGraphQLFetch(ISSUE_REPORT_QUERY, vars);

      const onSuccess = (data) => {
        dispatch({
          type: STATS_LOADED,
          payload: data,
        });
      };

      handleApiError(result, dispatch, STATS_LOAD_ERROR, onSuccess);
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

function loadIssuesByVars(queryVars, currentCacheIdentity) {
  return async (dispatch) => {
    try {
      const result = await tryGraphQLFetch(ISSUE_LIST_QUERY, queryVars);

      const onSuccess = (data) => {
        dispatch({
          type: ISSUES_LIST_LOADED,
          payload: Object.assign(
            data,
            { meta: { currentCacheIdentity, currentListVars: queryVars } },
          ),
        });
      };

      handleApiError(result, dispatch, ISSUES_LIST_LOAD_ERROR, onSuccess);
    } catch (error) {
      dispatch(onError(error.message, ISSUES_LIST_LOAD_ERROR));
    }
  };
}

function reloadCurrentPageIfNeeded(dispatch, getState) {
  // INFO: This check for current page reload might help when Live Editing comes.
  if (isCurrentIssuePageNeedsLoad(getState())) {
    dispatch({ type: ISSUES_LIST_LOADING });

    const [currentListVars, currentCacheIdentity] = getFilterData(getState());
    dispatch(
      loadIssuesByVars(currentListVars, currentCacheIdentity),
    );
  }
}

function clearIssuesCache(dispatch, getState, id, changedKeys = []) {
  dispatch({
    type: ISSUES_LIST_CACHE_RESET,
    payload: { id, changedKeys },
  });

  reloadCurrentPageIfNeeded(dispatch, getState);
}

export function initLoadIssues(match, search) {
  return (dispatch, getState) => {
    try {
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
      dispatch(loadIssuesByVars(vars, currentCacheIdentity));
    } catch (error) {
      dispatch(onError(error.message, ISSUES_LIST_LOAD_ERROR));
    }
  };
}

export function loadIssuePreview(id) {
  return async (dispatch, getState) => {
    let loadingTimeout;
    try {
      const vars = { id };
      dispatch({ type: ISSUE_SELECTED, payload: vars });

      if (getIssueLoading(getState(), id)) {
        return;
      }

      loadingTimeout = setTimeout(() => {
        dispatch({ type: ISSUE_LOADING, payload: vars });
      }, 600);

      // INFO: This is a cache field loaded by preview (IssueDetails component).
      const selectedIssue = getSelectedIssue(getState());
      if (selectedIssue && 'description' in selectedIssue) {
        dispatch({ type: ISSUE_CACHE_HIT, payload: vars });
        clearTimeout(loadingTimeout);
        return;
      }

      const onSuccess = (data) => {
        dispatch({
          type: ISSUE_LOADED,
          payload: data,
        });
      };

      const result = await tryGraphQLFetch(ISSUE_PREVIEW_QUERY, vars);
      handleApiError(result, dispatch, ISSUE_LOAD_ERROR, onSuccess);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_LOAD_ERROR));
    } finally {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    }
  };
}

export function loadIssue(id, onActionSuccess = (() => {})) {
  return async (dispatch, getState) => {
    try {
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
        onActionSuccess();
        return;
      }
      const query = issueLoadQueryBuilder(fieldsToLoad);
      const result = await tryGraphQLFetch(query, { id });

      const onSuccess = (data) => {
        dispatch({
          type: ISSUE_LOADED,
          payload: data,
        });
        onActionSuccess();
      };

      handleApiError(result, dispatch, ISSUE_LOAD_ERROR, onSuccess);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_LOAD_ERROR));
    }
  };
}

export function updateIssue(issue, onActionSuccess) {
  return async (dispatch, getState) => {
    try {
      const { id, created, ...changes } = issue;
      const issueBeforeUpdate = getIssue(getState(), id);

      dispatch({ type: ISSUE_LOADING, payload: { id } });

      const result = await tryGraphQLFetch(ISSUE_UPDATE_QUERY, { id, changes });

      const onSuccess = (data) => {
        dispatch({
          type: ISSUE_UPDATED,
          payload: data,
        });
        onActionSuccess();
      };

      handleApiError(result, dispatch, ISSUE_UPDATE_ERROR, onSuccess);

      // IDEA: These side affects tracking can be a good exercise for saga (redux-saga).
      const issueAfterUpdate = getIssue(getState(), id);
      const changedKeys = getFieldsListDiff(issueBeforeUpdate, issueAfterUpdate);

      clearIssuesCache(dispatch, getState, id, changedKeys);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_UPDATE_ERROR));
    }
  };
}

// TODO: [react-redux] fix it.
// Handle error when issue by id is not found as it was implemented before redux add.
export function issueClose(id) {
  return async (dispatch, getState) => {
    try {
      const vars = { id };
      const issueBeforeUpdate = getIssue(getState(), id);
      dispatch({ type: ISSUE_LOADING, payload: vars });

      const result = await tryGraphQLFetch(ISSUE_CLOSE_QUERY, vars);

      const onSuccess = (data) => {
        dispatch({
          type: ISSUE_UPDATED,
          payload: data,
        });
      };

      handleApiError(result, dispatch, ISSUE_UPDATE_ERROR, onSuccess);

      // IDEA: These side affects tracking can be a good exercise for saga (redux-saga).
      const issueAfterUpdate = getIssue(getState(), id);
      const changedKeys = getFieldsListDiff(issueBeforeUpdate, issueAfterUpdate);

      clearIssuesCache(dispatch, getState, id, changedKeys);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_UPDATE_ERROR));
    }
  };
}

// TODO: [react-redux] fix it. Handle when issue is not found in state.all.
// TODO: [react-redux] fix LOW bug. Total pages count does not refresh on prev page
//   when last issue from the current page.
// IDEA: [react-redux] Trigger page reload when the last issue in state.all deleted.
export function issueDelete(id, onActionSuccess) {
  return async (dispatch, getState) => {
    try {
      const vars = { id };
      dispatch({ type: ISSUE_LOADING, payload: vars });
      const result = await tryGraphQLFetch(ISSUE_DELETE_QUERY, vars);

      const onSuccess = (data) => {
        if (data && data.deleteIssue) {
          dispatch({
            type: ISSUE_DELETED,
            payload: vars,
          });
          onActionSuccess();

          clearIssuesCache(dispatch, getState, id);
        } else {
          dispatch(onError(`There is an error with issue #${id} deletion.`, ISSUE_DELETE_ERROR));
        }
      };

      handleApiError(result, dispatch, ISSUE_DELETE_ERROR, onSuccess);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_DELETE_ERROR));
    }
  };
}

export function issueRestore(id, onActionSuccess) {
  return async (dispatch, getState) => {
    try {
      const result = await tryGraphQLFetch(ISSUE_RESTORE_QUERY, { id });

      const onSuccess = (data) => {
        if (data && data.issueRestore) {
          const index = getJumpToDeletedActionIndex(getState());
          dispatch(ActionCreators.jumpToPast(index));
          onActionSuccess();
        } else {
          dispatch(onError(`There is an error with issue ${id} restore.`, ISSUE_RESTORE_ERROR));
        }
      };

      handleApiError(result, dispatch, ISSUE_RESTORE_ERROR, onSuccess);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_RESTORE_ERROR));
    }
  };
}

export function issueCreate(issue, onActionSuccess) {
  return async (dispatch, getState) => {
    try {
      const result = await tryGraphQLFetch(ISSUE_CREATE_QUERY, { issue });

      const onSuccess = (data) => {
        dispatch({
          type: ISSUE_CREATED,
          payload: data.addIssue,
        });
        onActionSuccess(data.addIssue);
        reloadCurrentPageIfNeeded(dispatch, getState);
      };

      handleApiError(result, dispatch, ISSUE_CREATE_ERROR, onSuccess);
    } catch (error) {
      dispatch(onError(error.message, ISSUE_CREATE_ERROR));
    }
  };
}
