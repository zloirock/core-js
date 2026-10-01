import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _self from "@core-js/pure/actual/self";
// An excluded realm root keeps the same environment-probe guard through stored
// and effect-prefixed carriers. A plain backed hop still folds, and a shadowing
// parameter stays outside the realm rule. Each carrier evaluates its effects once.
let a,
  b,
  c,
  effects = 0;
export const direct = _self.window?.name;
export const assigned = (a = globalThis, _self).window?.location;
export const sequence = (b = (effects++, globalThis), _self).window?.navigator;
export const nested = (effects++, c = globalThis, _self).window?.document;
export const backed = (a = globalThis, _self).name;
export function shadowed(globalThis) {
  var _ref;
  return null == (_ref = (a = globalThis).self.window) ? void 0 : _nameMaybeFunction(_ref);
}
export { a, b, c, effects };