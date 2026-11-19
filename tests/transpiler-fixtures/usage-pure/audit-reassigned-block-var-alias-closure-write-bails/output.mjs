import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A nested closure can overwrite the hoisted realm alias without rebinding it.
// Pure cannot fold the receiver: its live constructor read needs an identity guard,
// preserving both the realm static and the supplied value after a closure write.
function f() {
  var _ref;
  if (c) {
    var M = _globalThis;
  }
  function g() {
    M = somethingElse;
  }
  _ref = M.Array, _ref === Array ? _Array$from([1]) : _ref.from([1]);
}