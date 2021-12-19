export function getIssue(state, id) {
  return state.issues.present.all.find(issue => issue.id === id);
}

export function getSelectedIssue(state) {
  const id = state.issues.present.selectedIssueId;
  if (id == null) return null;

  return getIssue(state, id);
}

export function getIssueLoading(state, id) {
  return state.issuesUI.present.loadingIds[id];
}

export function getSelectedIssueLoading(state) {
  const id = state.issues.present.selectedIssueId;
  if (id == null) return false;

  return state.issuesUI.present.loadingIds[id];
}

export function getCurrentPageIssueIds(state) {
  const {
    issuesUI: { present: { identityToIssueIds, currentCacheIdentity } },
    issues: { present: { all } },
  } = state;
  const pageIds = identityToIssueIds[currentCacheIdentity] || [];
  const allIds = all.map(issue => issue.id);
  return pageIds.filter(id => allIds.includes(id));
}

export function isCurrentIssuePageNeedsLoad(state) {
  const { issuesUI } = state;
  return issuesUI.present.identityToIssueIds[issuesUI.present.currentCacheIdentity] === null;
}

export function getIssueListLoading(state) {
  return state.issuesUI.present.isLoading;
}

export function getIssuesPagesCount(state) {
  const { identityToPages, currentCacheIdentity } = state.issuesUI.present;
  return identityToPages[currentCacheIdentity];
}

export function getCacheIdentities(state) {
  return state.issuesUI.present.identityToIssueIds;
}

export function getCurrentIdentity(state) {
  return state.issuesUI.present.currentCacheIdentity;
}

export function getFilterData(state) {
  return [state.issuesUI.present.currentListVars, state.issuesUI.present.currentCacheIdentity];
}

export function getJumpToDeletedActionIndex(state) {
  return state.issuesUI.lastDeletedActionIndex;
}

export function getErrorMessage(state) {
  return state.notification.errorMessage;
}
