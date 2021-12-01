import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './rootReducer.js';

// eslint-disable-next-line import/no-mutable-exports
let store;

function initStore(initialData) {
  store = createStore(
    rootReducer,
    initialData,
    composeWithDevTools(
      applyMiddleware(thunk),
    ),
  );
}

export {
  store,
  initStore,
};
