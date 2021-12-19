const initialState = {};

export default function notificationReducer(state = initialState, { error }) {
  if (error && error.errorMessage) {
    return {
      ...state,
      errorMessage: error.errorMessage,
    };
  }
  return state;
}
