import { combineReducers } from 'redux';
import issuesReducer from './reducers/issue.js';
import statsReducer from './reducers/stats.js';

export default combineReducers({
  issueCounts: statsReducer,
  issuesList: issuesReducer,
});
