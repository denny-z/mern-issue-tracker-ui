export function getIssue(state, id) {
  return state.issues.all.find(issue => issue.id === id);
}

export function getSelectedIssue(state) {
  const id = state.issues.selectedIssueId;
  if (id == null) return null;

  return getIssue(state, id);
}

export function getCurrentPageIssues(state) {
  const { issues } = state;
  const issueIdsByCurrentParams = issues.queryToIssueIds[issues.currentQueryParams] || [];
  return issueIdsByCurrentParams.map(
    issueId => issues.all.find(issue => issue.id === issueId),
  ).filter(Boolean); /* Remove blank, if not found, e.g. from ISSUE_DELETE */
}
