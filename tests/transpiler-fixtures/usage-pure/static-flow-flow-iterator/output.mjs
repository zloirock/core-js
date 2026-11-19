import _Array$from from "@core-js/pure/actual/array/from";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  var _ref;
  let x = [];
  if (c) x = _valuesMaybeArray(_ref = [1, 7]).call(_ref);else x = [2];
  return _Array$from(_mapMaybeArray(x).call(x, v => v));
}
r = [f(true), f(false)];