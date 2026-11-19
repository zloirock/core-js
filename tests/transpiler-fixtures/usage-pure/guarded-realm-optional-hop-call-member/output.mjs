import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A CALLEE under that hop rides the same guard: the call moves INTO the branches, so `this` is the
// branch's own value and its arguments still run ahead of the throw a non-callable method owes,
// while the short-circuit is spelled once, over the whole render, off the hop's own base.
export function callMember(flag) {
  var _ref;
  if (flag) {
    var realm = _globalThis;
  }
  return null == realm ? void 0 : (_ref = realm.Array, _ref === Array ? _Array$of(7) : _ref.of(7));
}