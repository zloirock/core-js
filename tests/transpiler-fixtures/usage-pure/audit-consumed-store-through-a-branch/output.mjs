import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a store whose value LEAVES through a branch is read through all the same: the arm hands it to the
// reader above, so the probe folds there exactly as it does under a direct claim - both arms of a
// ternary and both operands of a logical carry it, a `&&` left included (it leaves when falsy, and
// that is still the value the reader receives). what carries nothing is a TEST slot: the branch
// reads it and hands its arms out instead, so the store there keeps the collapse's own spelling -
// the environment probe the source wrote to decide the branch stays a probe
let e = 0;
let held;
export const throughTernaryArm = _nameMaybeFunction((e ? held = (e++, _self) : _globalThis).Map);
export const throughTernaryAlternate = _nameMaybeFunction((e ? _globalThis : held = (e++, _self)).Map);
export const throughOr = _nameMaybeFunction(((held = (e++, _self)) || _globalThis).Map);
export const throughNullish = _nameMaybeFunction(((held = (e++, _self)) ?? _globalThis).Map);
export const throughAndRight = _nameMaybeFunction((_globalThis && (held = (e++, _self))).Map);
export const throughAndLeft = _nameMaybeFunction(((held = (e++, _self)) && _globalThis).Map);

// ... and the one that hands nothing to the reader: the store keeps the collapse's own spelling
export const testSlotKeepsIt = _nameMaybeFunction(((held = (e++, _self).window) ? _globalThis : _globalThis).Map);
export { e, held };