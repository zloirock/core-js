import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13;
// combined optional-call chains over a DOUBLE-hop kept-assign claim: the claim's root guard
// must not ride into a helper-GET argument or under a raw member read (a throw where native
// short-circuits) - it hoists into the outer test / over the raw tail on both emitters. the
// guard-hoist direction differs per shape (the outer test may queue before or after the claim),
// so each line locks one protocol direction
let n;
let t;
let c;
let u;
export const combinedTail = null == (_ref = null == (n = _globalThis.window) ? void 0 : _flatMaybeArray(_ref2 = _Array$of(1))) ? void 0 : _at(_ref3 = _ref.call(_ref2))?.call(_ref3, 0);
export const combinedNoTail = null == (_ref4 = t = _globalThis.window) ? void 0 : _flatMaybeArray(_ref5 = _Array$of(2))?.call(_ref5);
export const optionalAccess = null == (_ref6 = null == (c = _globalThis.window) ? void 0 : _Array$of(3)) ? void 0 : _flatMaybeArray(_ref6)?.call(_ref6);
export const rawMethodTail = null == (u = _globalThis.window) ? void 0 : _Array$of(4).userMethod?.();
// NESTED combined chains: the inner chain's own OR-guard is a guarded producer too - it hoists
// into the enclosing test the same way a claim guard does, at any nesting depth
let w;
export const nestedCombined = null == (_ref7 = null == (w = _globalThis.window) ? void 0 : _mapMaybeArray(_ref8 = _flatMaybeArray(_ref9 = _Array$of(5))?.call(_ref9))) ? void 0 : _at(_ref10 = _ref7.call(_ref8, x => x))?.call(_ref10, 0);
// a SECOND kept chain nested in the claim's ARGUMENT keeps its own guard and claims - the
// composed needle carries the nested chain's live `?.` (only the outer chain's hops deopt)
let a;
let b;
export const nestedKeptArg = null == (_ref11 = a = _globalThis.window) ? void 0 : _flatMaybeArray(_ref12 = _Array$of(null == (_ref13 = b = _globalThis.window) ? void 0 : _nameMaybeFunction(_Set)))?.call(_ref12);