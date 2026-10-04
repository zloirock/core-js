import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, other;
[,] = [Array];
from = _Array$from, {
  from: _unused,
  ...rest
} = Array;
from([1]);
rest;
[, _ref] = [Array, 1];
from = _Array$of, {
  of: _unused2,
  ...rest
} = Array;
other = _ref;
from(2);