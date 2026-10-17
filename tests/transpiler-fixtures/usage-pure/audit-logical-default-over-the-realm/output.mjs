import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a `??` / `||` over `globalThis` or `self` - the realm object, guaranteed by the language or by its pure
// entry, never nullish or falsy - always yields its left, so the right side is dead and both channels
// collapse at any nesting: the static is substituted and typed (no `.name` dispatch on a number). `window`,
// which has no pure entry, a nav that can short-circuit and a conditional's two live arms keep the carrier
// opaque: the static reads through an identity guard on the `Number` it yields, a native static owner
let out;
const c = 1;
const overRealm = _Number$MAX_SAFE_INTEGER.name;
const overRealmOr = _Number$MAX_SAFE_INTEGER.name;
const overProbeName = _Number$MAX_SAFE_INTEGER.name;
const overProbeNameOr = _Number$MAX_SAFE_INTEGER.name;
const overNestedDefault = _Number$MAX_SAFE_INTEGER.name;
const overProbeWindow = _nameMaybeFunction((_ref = (window ?? {}).Number, _ref === Number ? _Number$MAX_SAFE_INTEGER : _ref.MAX_SAFE_INTEGER));
const overProbeNav = _nameMaybeFunction((_ref2 = ((null == _globalThis.window ? void 0 : _self) ?? {
  Number
}).Number, _ref2 === Number ? _Number$MAX_SAFE_INTEGER : _ref2.MAX_SAFE_INTEGER));
const overConditional = _nameMaybeFunction(_Number$MAX_SAFE_INTEGER);
// the CTOR claim through the same carrier is a THIRD path: the receiver IS the logical there, where
// the static's receiver sits one member below it
const ctorOverRealm = new _Map();
const ctorOverProbeName = new _Map();
const ctorOverProbeWindow = new (window ?? {}).Map();
out = [overRealm, overRealmOr, overProbeName, overProbeNameOr, overNestedDefault, overProbeWindow, overProbeNav, overConditional, ctorOverRealm, ctorOverProbeName, ctorOverProbeWindow];
export const read = out;