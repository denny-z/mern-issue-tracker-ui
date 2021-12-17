import undoable, { ActionTypes, includeAction } from 'redux-undo';
import { ISSUES_LIST_LOADED, ISSUE_CACHE_HIT, ISSUE_DELETED } from './types.js';

function rememberLastDeleteEnhancer(reducer) {
  return (state, action) => {
    const reducerResult = reducer(state, action);
    switch (action.type) {
      case ISSUE_DELETED: {
        return {
          ...reducerResult,
          lastDeletedActionIndex: reducerResult.index - 1,
        };
      }
      case ActionTypes.UNDO:
      case ActionTypes.JUMP: {
        return {
          ...reducerResult,
          lastDeletedActionIndex: null,
        };
      }
      default: {
        return {
          ...reducer(state, action),
          lastDeletedActionIndex: state && state.lastDeletedActionIndex,
        };
      }
    }
  };
}

const config = {
  filter: includeAction([ISSUE_DELETED, ISSUES_LIST_LOADED, ISSUE_CACHE_HIT]),
};

export default function undoableEnhancer(reducer, params = { withRemember: true }) {
  const undoableWrap = undoable(reducer, config);

  return params.withRemember
    ? rememberLastDeleteEnhancer(undoableWrap)
    : undoableWrap;
}
