// This function was added, even it's not described in the book,
// to reuse code instead of copy-pasting it.

export default function prepareIssueFilterVars(params) {
  const vars = {};
  if (params.get('status')) vars.status = params.get('status');

  const effortMin = parseInt(params.get('effortMin'), 10);
  if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
  const effortMax = parseInt(params.get('effortMax'), 10);
  if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;
  return vars;
}
