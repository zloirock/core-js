import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// The callback can call a method of its source array through a TypeScript assertion.
const rows = ['word'];
rows.reduce((sum, value, index, source) => {
  _fillMaybeArray(source).call(source, [7]);
  return sum;
}, 0);
export const first = _at(_ref = rows[0]).call(_ref, 0);