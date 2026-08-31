import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2;
// what a chain-assign store hands on is its VALUE, and the name of that value comes from the
// resolution canon - so an ALIAS of the realm proves the `?.` dead exactly as its literal spelling
// does, with a receiver-DEPENDENT tail as much as a receiver-independent one. definedness is the
// only boundary: an alias holding the environment probe, or holding no realm at all, keeps its guard
let w, a, u;
const gw = _globalThis;
const probe = _globalThis.window;
const plain = {
  self: {}
};
export const dependentTail = _atMaybeArray(_ref = (w = gw, _Array$of)(5)).call(_ref, 0);
export const overProbeAlias = null == (a = probe) ? void 0 : _nameMaybeFunction(_Set.prototype.add);
export const overPlainAlias = null == (_ref2 = u = plain) ? void 0 : _nameMaybeFunction(_ref2.self.WeakMap.prototype.get);