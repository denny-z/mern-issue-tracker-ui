import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';

import { Provider } from 'react-redux';
import Page from '../src/Page.jsx';
import template from './template.js';

import simpleStore from '../src/store.js';
import { store, initStore } from '../src/redux/store.js';
import routes from '../src/routes.js';

async function render(req, res) {
  const activeRoute = routes.find(
    route => matchPath(req.path, route),
  );
  const { cookie } = req.headers;

  let initialData;
  if (activeRoute && activeRoute.component.fetchData) {
    const match = matchPath(req.path, activeRoute);
    const index = req.url.indexOf('?');
    const search = index !== -1 ? req.url.substr(index) : null;

    const fetchDataResult = await activeRoute.component
      .fetchData(match, search, console.error, cookie);
    if (typeof fetchDataResult === 'function') {
      await fetchDataResult((action) => {
        initialData = action.payload;
      });
    } else {
      initialData = fetchDataResult;
    }
  }

  simpleStore.initialData = initialData;

  const userData = await Page.fetchData(null, null, null, cookie);
  simpleStore.userData = userData;

  initStore(initialData);

  const context = {};

  const element = (
    <StaticRouter location={req.url} context={context}>
      <Provider store={store}>
        <Page />
      </Provider>
    </StaticRouter>
  );
  const body = ReactDOMServer.renderToString(element);

  if (context.url) {
    res.redirect(301, context.url);
  } else {
    res.send(template(body, initialData, userData));
  }
}

export default render;
