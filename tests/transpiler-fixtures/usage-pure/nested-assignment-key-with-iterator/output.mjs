import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// Each pattern reads the intermediate slot once, including quoted and numeric property names.
let item, iterator;
({
  'a-b': _ref
} = _globalThis.Array);
({
  item
} = _ref), iterator = _getIteratorMethod(_ref);
({
  0: _ref2
} = _globalThis.Array);
({
  item
} = _ref2), iterator = _getIteratorMethod(_ref2);
export { item, iterator };