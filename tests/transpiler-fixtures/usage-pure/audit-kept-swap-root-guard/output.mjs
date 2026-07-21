import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a single proxy hop under a DOUBLE `?.` over an undefinable root: the leaf swap used to
// claim the prefix always-defined and ate the ROOT guard - native short-circuits to
// undefined where the emit read a live value (or threw). the guard now survives, binds the
// deepest optional's root, and the hop folds onto the guarded read
_globalThis.Set = class PatchedSet extends Set {};
let v;
export const mutatedSingle = null == (_ref = v = _globalThis.window) ? void 0 : _nameMaybeFunction(_ref.Set);
let n;
export const nonMutatedSingle = null == (_ref2 = n = _globalThis.window) ? void 0 : _nameMaybeFunction(_WeakSet);
// the ALIAS spelling hides the undefinable navigation behind the binding - same guard
const w = _globalThis.window;
let a;
export const aliasMutated = null == (_ref3 = a = w) ? void 0 : _nameMaybeFunction(_ref3.Set);
let b;
export const aliasNonMutated = null == (_ref4 = b = w) ? void 0 : _nameMaybeFunction(_WeakSet);
// REDUNDANT double parens around the root spell BARE in the guard memo on both emitters
// (a required single paren already strips; sequence parens always survive)
let dp;
export const doubleParenRoot = null == (_ref5 = dp = _globalThis.window) ? void 0 : _nameMaybeFunction(_ref5.Set);
// an always-defined root keeps the locked leaf-swap deopt (control)
let p;
export const resolvableRoot = _nameMaybeFunction((p = _globalThis, _self).Set);
// a static claim over the undefinable root keeps its ponyfill INSIDE the surviving guard
let c;
export const claimUnderGuard = null == (c = _globalThis.window) ? void 0 : _Array$of(1);