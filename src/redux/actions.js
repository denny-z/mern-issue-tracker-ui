/* eslint-disable import/prefer-default-export */

import { ISSUE_LIST_QUERY, ISSUE_PREVIEW_QUERY, ISSUE_REPORT_QUERY } from '../api/issue_queries.js';
import graphQLFetch from '../graphQLFetch.js';
import prepareIssueFilterVars from '../prepareIssueFilterVars.js';
import {
  ISSUES_LIST_LOADED, ISSUES_LIST_LOADING, ISSUE_PREVIEW_LOADED, STATS_CLEAR, STATS_LOADED,
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

    const storeQueryParams = getState().issuesList.currentQueryParams;
    const currentQueryParams = identifyQueryParams(match, search);

    if (storeQueryParams === currentQueryParams) return;

    dispatch({ type: ISSUES_LIST_LOADING });
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
  return async (dispatch) => {
    const vars = { id };
    const data = await graphQLFetch(ISSUE_PREVIEW_QUERY, vars, showError);

    dispatch({
      type: ISSUE_PREVIEW_LOADED,
      payload: data,
    });
  };
}