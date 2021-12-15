import {
  ISSUES_LIST_LOADED, ISSUE_CREATED, ISSUE_DELETED, ISSUE_LOADED, ISSUE_SELECTED, ISSUE_UPDATED,
} from '../types.js';

const initialState = { all: [] };

export default function issuesReducer(state = initialState, { payload: p, type }) {
  switch (type) {
    case ISSUES_LIST_LOADED: {
      const payloadIssues = p.issuesList.issues;
      let newIssues;
      if (state.all && state.all.length) {
        newIssues = [...state.all];
        payloadIssues.forEach((newIssue) => {
          const index = newIssues.findIndex(issue => issue.id === newIssue.id);
          if (index !== -1) {
            Object.assign(newIssues[index], newIssue);
          } else {
            newIssues.push(newIssue);
          }
        });
      } else {
        newIssues = payloadIssues;
      }

      const selectedIssueId = p.issue && p.issue.id;
      if (selectedIssueId != null) {
        const foundIssueIndex = newIssues.findIndex(i => i.id === selectedIssueId);
        if (foundIssueIndex !== -1) {
          Object.assign(newIssues[foundIssueIndex], p.issue);
        }
      }

      return {
        ...state,
        all: newIssues,
        selectedIssueId,
      };
    }
    case ISSUE_SELECTED: {
      return {
        ...state,
        selectedIssueId: p.id,
      };
    }
    case ISSUE_LOADED: {
      const newIssues = [...state.all];
      const loadedIssue = p.issue;
      const issueIndex = newIssues.findIndex(issue => issue.id === loadedIssue.id);
      if (issueIndex !== -1) {
        Object.assign(newIssues[issueIndex], loadedIssue);
        newIssues[issueIndex] = { ...newIssues[issueIndex] };
      } else {
        newIssues.push(loadedIssue);
      }

      return {
        ...state,
        all: newIssues,
      };
    }
    case ISSUE_CREATED: {
      const newIssues = state.all.concat([p]);
      return {
        ...state,
        all: newIssues,
      };
    }
    // TODO: [react-redux] fix it. Handle when issue is not found in state.all.
    case ISSUE_UPDATED: {
      const newIssue = p.issueUpdate;
      const newIssues = [...state.all];
      const issueIndex = newIssues.findIndex(issue => issue.id === newIssue.id);
      newIssues.splice(issueIndex, 1, newIssue);

      return {
        ...state,
        all: newIssues,
      };
    }
    case ISSUE_DELETED: {
      const newIssues = state.all.filter(issue => issue.id !== p.id);

      let { selectedIssueId } = state;
      if (state.selectedIssueId === p.id) {
        selectedIssueId = null;
      }

      return {
        ...state,
        all: newIssues,
        selectedIssueId,
      };
    }
    default: return state;
  }
}
