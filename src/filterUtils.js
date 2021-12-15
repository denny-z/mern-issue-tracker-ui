import URLSearchParams from 'url-search-params';

export function prepareIssueFilterVars(params) {
  const vars = {};
  if (params.get('status')) vars.status = params.get('status');

  const effortMin = parseInt(params.get('effortMin'), 10);
  if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
  const effortMax = parseInt(params.get('effortMax'), 10);
  if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;
  return vars;
}

export function prepareListVars(match, search) {
  const params = new URLSearchParams(search);
  const vars = { hasSelection: false, selectedId: 0 };
  Object.assign(vars, prepareIssueFilterVars(params));

  const { params: { id } } = match;
  const idInt = parseInt(id, 10);
  if (!Number.isNaN(idInt)) {
    vars.hasSelection = true;
    vars.selectedId = idInt;
  }
  let page = parseInt(params.get('page'), 10);
  if (Number.isNaN(page)) page = 1;
  vars.page = page;

  return vars;
}

const OMMITED_IDENTITY_KEYS = ['hasSelection', 'selectedId'];
export function generateCacheIdentity(match, search) {
  const vars = prepareListVars(match, search);
  const keys = Object.keys(vars).filter(key => !OMMITED_IDENTITY_KEYS.includes(key)).sort();
  const identifyVars = {};
  keys.forEach((key) => { identifyVars[key] = vars[key]; });
  return JSON.stringify(identifyVars);
}
