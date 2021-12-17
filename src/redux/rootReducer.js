import { combineReducers } from 'redux';
import issuesReducer from './reducers/issuesReducer.js';
import issuesUIReducer from './reducers/issuesUIReducer.js';
import statsReducer from './reducers/statsReducer.js';
import undoableEnhancer from './undoableConfig.js';

export default combineReducers({
  issueCounts: statsReducer,
  issues: undoableEnhancer(issuesReducer, { withRemember: false }),
  issuesUI: undoableEnhancer(issuesUIReducer),
});
