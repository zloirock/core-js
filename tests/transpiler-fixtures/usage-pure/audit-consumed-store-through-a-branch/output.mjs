import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// A stored navigation carried by a branch reaches the constructor claim above it.
// Both ternary arms and logical operands select the realm, so Map injects while stores and
// effects remain in place. A store used only as the test retains its environment probe.
let e = 0;
let held;
export const throughTernaryArm = _nameMaybeFunction((e ? held = (e++, _self) : _globalThis, _Map));
export const throughTernaryAlternate = _nameMaybeFunction((e ? _globalThis : held = (e++, _self), _Map));
export const throughOr = _nameMaybeFunction(((held = (e++, _self)) || _globalThis, _Map));
export const throughNullish = _nameMaybeFunction(((held = (e++, _self)) ?? _globalThis, _Map));
export const throughAndRight = _nameMaybeFunction((_globalThis && (held = (e++, _self)), _Map));
export const throughAndLeft = _nameMaybeFunction(((held = (e++, _self)) && _globalThis, _Map));

// ... and the one that hands nothing to the reader: the store keeps the collapse's own spelling
export const testSlotKeepsIt = _nameMaybeFunction(((held = (e++, _self).window) ? _globalThis : _globalThis, _Map));

// Plain navigation and effectful sequence arms still provide the realm's Map.
// A live optional arm retains its selected value and throws if that value is absent.
let c = 0;
export const navArms = _nameMaybeFunction(_Map);
export const navBothArms = _nameMaybeFunction(_Map);
export const liveOptionalArm = _nameMaybeFunction((_ref = c ? null == _globalThis.window ? void 0 : _self : _globalThis, _ref === _self ? _Map : _ref.Map));
export const seqArm = _nameMaybeFunction((_ref2 = c ? (c++, _self) : _globalThis, _ref2 === _self ? _Map : _ref2.Map));
export { c, e, held };