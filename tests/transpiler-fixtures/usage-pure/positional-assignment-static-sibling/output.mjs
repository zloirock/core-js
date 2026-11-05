import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A positional assignment keeps the native Object.keys read beside a captured array at leaf.
// Each binding uses its own element's value.
const array = [2, 7],
  rows = [Object, array];
let keys, at;
[{
  keys
}, _ref] = rows;
at = _atMaybeArray(_ref);
export const result = [keys({
  x: 1
}), at.call(array, -1)];