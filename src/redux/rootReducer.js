import { combineReducers } from 'redux';
import { STATS_CLEAR, STATS_LOADED } from './types.js';

function statsReducer(state = {}, action) {
  switch (action.type) {
    case STATS_LOADED:
      return { stats: action.payload.issueCounts, isLoaded: true };
    case STATS_CLEAR:
      return { stats: [], isLoaded: false };
    default: return state;
  }
}

export default combineReducers({
  issueCounts: statsReducer,
});
