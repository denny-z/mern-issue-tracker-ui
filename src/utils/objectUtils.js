/* eslint-disable import/prefer-default-export */

// A shourtcut function.
function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function getFieldsListDiff(left, right) {
  const allKeys = Object.keys(left).concat(Object.keys(right));
  const keys = [...new Set(allKeys)];

  return keys.reduce((result, key) => {
    if (has(left, key) && has(right, key)) {
      if (left[key] === right[key]) return result;
    }
    return [...result, key];
  }, []);
}
