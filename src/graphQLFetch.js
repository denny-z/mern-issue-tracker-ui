import fetch from 'isomorphic-fetch';

const dateRegexp = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReciever(key, value) {
  if (dateRegexp.test(value)) return new Date(value);
  return value;
}

export async function tryGraphQLFetch(query, variables = {}, cookie) {
  // eslint-disable-next-line no-undef
  const apiEnpoint = __isBrowser__ ? window.ENV.UI_API_ENDPOINT
    : process.env.UI_SERVER_API_ENDPOINT;

  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(apiEnpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    credentials: 'include',
  });
  const body = await response.text();
  return JSON.parse(body, jsonDateReciever);
}

export function formatErrorToMessage(error) {
  if (error.extensions.code === 'BAD_USER_INPUT') {
    const details = (error.extensions.exception.errors || []).join('\n');
    return `${error.message}:\n${details}`;
  }
  return `${error.extensions.code}: ${error.message}`;
}

export default async function graphQLFetch(query, variables = {}, showError = null, cookie) {
  try {
    const result = await tryGraphQLFetch(query, variables, cookie);

    if (result.errors && typeof showError === 'function') {
      const error = result.errors[0];
      const errorMessage = formatErrorToMessage(error);
      showError(errorMessage);
    }

    return result.data;
  } catch (e) {
    if (showError) showError(`Error in sending data to server: ${e.message}`);
    return null;
  }
}
