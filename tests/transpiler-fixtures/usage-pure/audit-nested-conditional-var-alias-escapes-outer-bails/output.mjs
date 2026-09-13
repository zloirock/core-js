import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Both nested branches must run to initialize the hoisted realm alias.
// The read outside them cannot fold directly. Pure guards the live constructor,
// preserving the uninitialized-alias throw and the static on the initialized path.
function f() {
  var _ref;
  if (a) {
    if (b) {
      var M = _globalThis;
    }
  }
  _ref = M.Array, _ref === Array ? _Array$of([1]) : _ref.of([1]);
}