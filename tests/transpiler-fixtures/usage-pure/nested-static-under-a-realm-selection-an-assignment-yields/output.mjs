import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
// An assignment whose value the code reads yields the realm selection whole, so where it may yield the
// user's object no mirror may replace its realm arm either: the nested static reads the captured hop through
// the identity guard, the user's arm keeping its own slot instead of the realm's ponyfill.
let from, of;
const host = (_ref = {
  Array: _ref2
} = c ? _globalThis : shim, from = _ref2 === Array ? _Array$from : _ref2.from, _ref);
use((_ref3 = {
  Array: _ref4
} = shim || _globalThis, of = _ref4 === Array ? _Array$of : _ref4.of, _ref3));
export { host, from, of };