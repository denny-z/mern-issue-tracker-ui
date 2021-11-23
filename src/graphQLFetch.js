import fetch from 'isomorphic-fetch';

const dateRegexp = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReciever(key, value) {
  if (dateRegexp.test(value)) return new Date(value);
  return value;
}

export default async function graphQLFetch(query, variables = {}, showError = null, cookie) {
  // eslint-disable-next-line no-undef
  const apiEnpoint = __isBrowser__ ? window.ENV.UI_API_ENDPOINT
    : process.env.UI_SERVER_API_ENDPOINT;

  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;

  try {
    const response = await fetch(apiEnpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      credentials: 'include',
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReciever);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = (error.extensions.exception.errors || []).join('\n');
        if (showError) showError(`${error.message}:\n${details}`);
      } else if (showError) {
        showError(`${error.extensions.code}: ${error.message}`);
      }
    }

    return result.data;
  } catch (e) {
    if (showError) showError(`Error in sending data to server: ${e.message}`);
    return null;
  }
}
