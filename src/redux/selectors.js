export function getIssue(state, id) {
  return state.issues.all.find(issue => issue.id === id);
}

export function getSelectedIssue(state) {
  const id = state.issues.selectedIssueId;
  if (id == null) return null;

  return getIssue(state, id);
}

export function getIssueLoading(state, id) {
  return state.issues.loadingIds[id];
}

export function getSelectedIssueLoading(state) {
  const id = state.issues.selectedIssueId;
  if (id == null) return false;

  return state.issues.loadingIds[id];
}

export function getCurrentPageIssueIds(state) {
  const { issues } = state;
  return issues.queryToIssueIds[issues.currentQueryParams] || [];
}
