/* eslint-disable import/prefer-default-export */

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
import graphQLFetch from '../graphQLFetch.js';
import prepareIssueFilterVars from '../prepareIssueFilterVars.js';
import { getIssue, getIssueLoading, getSelectedIssue } from './selectors.js';
import {
  STATS_CLEAR,
  STATS_LOADED,
  ISSUES_LIST_LOADED,
  ISSUES_LIST_LOADING,
  ISSUES_LIST_CACHE_HIT,
  ISSUE_LOADED,
  ISSUE_UPDATED,
  ISSUE_DELETED,
  ISSUE_RESTORED,
  ISSUE_SELECTED,
  ISSUE_CREATED,
  ISSUE_LOADING,
  ISSUE_CACHE_HIT,
} from './types.js';

// TODO: [react-redux] Implement global error handling instead of pass showError argument.
export function loadStats(match, search, showError) {
  return async (dispatch) => {
    const params = new URLSearchParams(search);
    const vars = prepareIssueFilterVars(params);
    const data = await graphQLFetch(ISSUE_REPORT_QUERY, vars, showError);

    dispatch({
      type: STATS_LOADED,
      payload: data,
    });
  };
}

export function clearStats() {
  return {
    type: STATS_CLEAR,
  };
}

function identifyQueryParams(match, search) {
  return JSON.stringify(match) + search;
}

export function loadIssues(match, search, showError) {
  return async (dispatch, getState) => {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    Object.assign(vars, prepareIssueFilterVars(params));

    const { params: { id } } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }
    let page = params.get('page', 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    const { queryToIssueIds } = getState().issues;
    const currentQueryParams = identifyQueryParams(match, search);

    dispatch({ type: ISSUES_LIST_LOADING });
    // TODO: [react-redux] fix minor issue.
    //   Steps:
    //   1. Go to issues list and select some filers. You are on first page of results.
    //   2. Click to Page 1. page=1 is added to URL.
    //   Actual result: data is reloaded.
    //   Expected result: data should be loaded from cache.
    //   This may be realted to stringify nature of identifyQueryParams OR
    //     remove page=1 from URL if first page selected.
    if (queryToIssueIds[currentQueryParams]) {
      dispatch({
        type: ISSUES_LIST_CACHE_HIT,
        payload: { meta: { currentQueryParams } },
      });
      return;
    }

    const data = await graphQLFetch(ISSUE_LIST_QUERY, vars, showError);
    dispatch({
      type: ISSUES_LIST_LOADED,
      payload: Object.assign(
        data,
        { meta: { currentQueryParams } },
      ),
    });
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
  return async (dispatch) => {
    const { id, created, ...changes } = issue;
    dispatch({ type: ISSUE_LOADING, payload: { id } });

    const data = await graphQLFetch(ISSUE_UPDATE_QUERY, { id, changes }, showError);

    dispatch({
      type: ISSUE_UPDATED,
      payload: data,
    });
    onSuccess();
  };
}

// TODO: [react-redux] fix it.
// Handle error when issue by id is not found as it was implemented before redux add.
export function issueClose(id, showError) {
  return async (dispatch) => {
    const vars = { id };
    dispatch({ type: ISSUE_LOADING, payload: vars });

    const data = await graphQLFetch(ISSUE_CLOSE_QUERY, vars, showError);

    dispatch({
      type: ISSUE_UPDATED,
      payload: data,
    });
  };
}

export function issueDelete(id, showError, onSuccess) {
  return async (dispatch) => {
    const vars = { id };
    dispatch({ type: ISSUE_LOADING, payload: vars });
    const data = await graphQLFetch(ISSUE_DELETE_QUERY, vars, showError);

    if (data && data.deleteIssue) {
      dispatch({
        type: ISSUE_DELETED,
        payload: vars,
      });
      onSuccess();
    }
  };
}

// TODO: [react-redux] fix that issue does not appear.
// Steps:
// 1. Delete issue.
// 2. Restore issue from Toast by clicking "Undo".
// Actual result: Issue does not appear in issues list.
// Expected result: Issue will appear (at least at the bottom of current list).
export function issueRestore(id, showError, showSuccessWithMessage) {
  return async (dispatch) => {
    const data = await graphQLFetch(ISSUE_RESTORE_QUERY, { id }, showError);

    if (data && data.issueRestore) {
      dispatch({
        type: ISSUE_RESTORED,
        payload: data,
      });
      showSuccessWithMessage();
    }
  };
}

// TODO: [react-redux] fix that issue does not appear.
// Steps:
// 1. Go to last page of IssueList.
// 2. Create issue (via + in nav bar).
// Actual result: Issue does not appear in issues list.
// Expected result: Issue will appear (at least at the bottom of current list).
export function issueCreate(issue, showError, onSuccess) {
  return async (dispatch) => {
    const data = await graphQLFetch(ISSUE_CREATE_QUERY, { issue }, showError);

    if (data) {
      dispatch({
        type: ISSUE_CREATED,
        payload: data.addIssue,
      });
      onSuccess(data.addIssue);
    }
  };
}
