import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// negatives
export function oneArmIsNotTheRealm(flag) {
  var _ref;
  if (flag) {
    var N = _globalThis;
  } else {
    var N = {};
  }
  return _ref = N.Array, _ref === Array ? _Array$of(3) : _ref.of(3);
}