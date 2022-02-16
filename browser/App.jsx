import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import Page from '../src/Page.jsx';
import simpleStore from '../src/store.js';
import store from '../src/redux/store.js';

// eslint-disable-next-line no-underscore-dangle
const initialData = window.__INITIAL_DATA__;
// eslint-disable-next-line no-underscore-dangle
simpleStore.userData = window.__USER_DATA__;

if (initialData && initialData.type) {
  store.dispatch(initialData);
} else {
  simpleStore.initialData = initialData;
}

const element = (
  <Router>
    <Provider store={store}>
      <Page />
    </Provider>
  </Router>
);

ReactDOM.hydrate(element, document.getElementById('content'));

if (module.hot) {
  module.hot.accept();
}
