import { includeAction } from 'redux-undo';
import { ISSUE_DELETED } from './types.js';

export default {
  filter: includeAction([ISSUE_DELETED]),
};
