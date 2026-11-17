import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A quoted intermediate slot is read once before its iterator property.
let item, iterator;
({
  'a-b': _ref
} = _globalThis.Array);
({
  item
} = _ref), iterator = _getIteratorMethod(_ref);
export { item, iterator };