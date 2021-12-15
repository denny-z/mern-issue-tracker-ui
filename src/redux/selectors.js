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
  const { issuesUI: { identityToIssueIds, currentCacheIdentity }, issues: { all } } = state;
  const pageIds = identityToIssueIds[currentCacheIdentity] || [];
  const allIds = all.map(issue => issue.id);
  return pageIds.filter(id => allIds.includes(id));
}

export function isCurrentIssuePageNeedsLoad(state) {
  const { issuesUI } = state;
  return issuesUI.identityToIssueIds[issuesUI.currentCacheIdentity] === null;
}

export function getIssueListLoading(state) {
  return state.issuesUI.isLoading;
}

export function getIssuesPagesCount(state) {
  const { identityToPages, currentCacheIdentity } = state.issuesUI;
  return identityToPages[currentCacheIdentity];
}

export function getCacheIdentities(state) {
  return state.issuesUI.identityToIssueIds;
}

export function getCurrentIdentity(state) {
  return state.issuesUI.currentCacheIdentity;
}
