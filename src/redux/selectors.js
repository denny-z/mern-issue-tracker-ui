export function getIssue(state, id) {
  return state.issuesList.issues.find(issue => issue.id === id);
}

export function getSelectedIssue(state) {
  const id = state.issuesList.selectedIssueId;
  if (id == null) return null;

  return getIssue(state, id);
}

export function getCurrentPageIssues(state) {
  const { issuesList } = state;
  const issueIdsByCurrentParams = issuesList.queryToIssueIds[issuesList.currentQueryParams] || [];
  return issueIdsByCurrentParams.map(
    issueId => issuesList.issues.find(issue => issue.id === issueId),
  ).filter(Boolean); /* Remove blank, if not found, e.g. from ISSUE_DELETE */
}
