import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The var binding hoists, but its realm initializer runs only in the selected branch.
// The later read may observe either the realm or undefined. Pure must retain that read
// and guard the constructor before choosing the static polyfill.
function f() {
  var _ref;
  if (c) {
    var M = _globalThis;
  }
  _ref = M.Array, _ref === Array ? _Array$from([1]) : _ref.from([1]);
}