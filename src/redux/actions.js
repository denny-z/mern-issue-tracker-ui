/* eslint-disable import/prefer-default-export */

import { ISSUE_REPORT_QUERY } from '../api/issue_queries.js';
import graphQLFetch from '../graphQLFetch.js';
import prepareIssueFilterVars from '../prepareIssueFilterVars.js';
import { STATS_LOADED } from './types.js';

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
