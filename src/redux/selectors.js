export function getIssue(state, id) {
  return state.issues.all.find(issue => issue.id === id);
}

export function getSelectedIssue(state) {
  const id = state.issues.selectedIssueId;
  if (id == null) return null;

  return getIssue(state, id);
}

export function getIssueLoading(state, id) {
  return state.issuesUI.loadingIds[id];
}

export function getSelectedIssueLoading(state) {
  const id = state.issues.selectedIssueId;
  if (id == null) return false;

  return state.issuesUI.loadingIds[id];
}

export function getCurrentPageIssueIds(state) {
  const { issuesUI } = state;
  return issuesUI.queryToIssueIds[issuesUI.currentQueryParams] || [];
}

export function getIssueListLoading(state) {
  return state.issuesUI.isLoading;
}

export function getIssuesPagesCount(state) {
  return state.issuesUI.totalPages;
}
