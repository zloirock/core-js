import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2, _ref3, _ref4, _ref5, _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, other;
[_ref] = _ref2 = [Array], from = _Array$from, {
  from: _unused,
  ...rest
} = _ref, _ref, _ref2;
from([1]);
rest;
[_ref3, _ref4] = [Array, 1];
from = _Array$of, {
  of: _ref5,
  ...rest
} = _ref3, _ref3;
other = _ref4;
from(2);