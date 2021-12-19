import { ERROR_HIDE } from '../types.js';

const initialState = {};

export default function notificationReducer(state = initialState, { error, type }) {
  if (error && error.errorMessage) {
    return {
      ...state,
      errorMessage: error.errorMessage,
      needShow: true,
    };
  }
  if (type === ERROR_HIDE) {
    return {
      ...state,
      needShow: false,
    };
  }
  return state;
}
