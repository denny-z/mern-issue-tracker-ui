import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import Page from '../src/Page.jsx';
import store from '../src/store.js';


// eslint-disable-next-line no-underscore-dangle
store.initialData = window.__INITIAL_DATA__;
// eslint-disable-next-line no-underscore-dangle
store.userData = window.__USER_DATA__;

const element = (
  <Router>
    <Page />
  </Router>
);

ReactDOM.hydrate(element, document.getElementById('content'));

if (module.hot) {
  module.hot.accept();
}
