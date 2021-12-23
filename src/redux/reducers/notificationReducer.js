import { HIDE_NOTIFICATION, SUCCESS_NOTIFICATION } from '../types.js';

const initialState = {
  isError: false,
  needShow: false,
  message: null,
  component: null,
};

export default function notificationReducer(state = initialState, {
  error, type, payload, component,
}) {
  if (error && error.errorMessage) {
    return {
      message: error.errorMessage,
      component: null,
      needShow: true,
      isError: true,
    };
  }
  if (component && component.name) {
    return {
      component,
      message: null,
      needShow: true,
      isError: payload.isError || state.isError,
    };
  }
  if (type === HIDE_NOTIFICATION) {
    return {
      ...initialState,
    };
  }
  if (type === SUCCESS_NOTIFICATION) {
    return {
      ...state,
      message: payload.message,
      component: null,
      needShow: true,
      isError: false,
    };
  }
  return state;
}
