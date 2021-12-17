import { combineReducers } from 'redux';
import undoable from 'redux-undo';
import issuesReducer from './reducers/issuesReducer.js';
import issuesUIReducer from './reducers/issuesUIReducer.js';
import statsReducer from './reducers/statsReducer.js';
import undoableConfig from './undoableConfig.js';

export default combineReducers({
  issueCounts: statsReducer,
  issues: undoable(issuesReducer, undoableConfig),
  issuesUI: undoable(issuesUIReducer, undoableConfig),
});
