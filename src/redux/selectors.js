/* eslint-disable import/prefer-default-export */
export function getSelectedIssue(state) {
  if (state.issuesList.selectedIssueId == null) return null;

  return state.issuesList.issues.find(issue => issue.id === state.issuesList.selectedIssueId);
}
