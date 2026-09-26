import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, other;
[_ref] = _ref2 = [Array], _ref3 = _ref, from = _Array$from, {
  from: _unused,
  ...rest
} = _ref3, _ref3, _ref2;
from([1]);
rest;
[_ref4, _ref5] = [Array, 1];
_ref6 = _ref4, from = _Array$of, {
  of: _ref7,
  ...rest
} = _ref6, _ref6;
other = _ref5;
from(2);