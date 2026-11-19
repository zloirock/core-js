import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-of head can replace the hoisted realm alias, or leave its initializer when empty.
// Pure must keep the live constructor read and guard its static; a direct fold would
// discard the replacement value and its native behavior.
function f(arr) {
  var _ref;
  {
    var g = _globalThis;
  }
  for (g of arr) {}
  _ref = g.Array, _ref === Array ? _Array$from([1, 2, 3]) : _ref.from([1, 2, 3]);
}
f([]);