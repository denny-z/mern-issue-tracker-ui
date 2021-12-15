import { combineReducers } from 'redux';
import issuesReducer from './reducers/issuesReducer.js';
import issuesUIReducer from './reducers/issuesUIReducer.js';
import statsReducer from './reducers/statsReducer.js';

export default combineReducers({
  issueCounts: statsReducer,
  issues: issuesReducer,
  issuesUI: issuesUIReducer,
});
