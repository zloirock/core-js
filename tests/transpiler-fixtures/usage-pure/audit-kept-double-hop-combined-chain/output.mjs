import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref18;
// combined optional-call chains over a DOUBLE-hop kept-assign claim: the claim's root guard
// must not ride into a helper-GET argument or under a raw member read (a throw where native
// short-circuits) - it hoists into the outer test / over the raw tail on both emitters. the
// guard-hoist direction differs per shape (the outer test may queue before or after the claim),
// so each line locks one protocol direction
let n;
let t;
let c;
let u;
export const combinedTail = null == (_ref = null == (n = _globalThis.window) ? void 0 : _Array$of(1)) || null == (_ref2 = _flatMaybeArray(_ref)) ? void 0 : _atMaybeArray(_ref3 = _ref2.call(_ref))?.call(_ref3, 0);
export const combinedNoTail = null == (t = _globalThis.window) ? void 0 : _flatMaybeArray(_ref4 = _Array$of(2))?.call(_ref4);
export const optionalAccess = null == (_ref5 = null == (c = _globalThis.window) ? void 0 : _Array$of(3)) ? void 0 : _flatMaybeArray(_ref5)?.call(_ref5);
export const rawMethodTail = null == (u = _globalThis.window) ? void 0 : _Array$of(4).userMethod?.();
// NESTED combined chains: the inner chain's own OR-guard is a guarded producer too - it hoists
// into the enclosing test the same way a claim guard does, at any nesting depth
let w;
export const nestedCombined = null == (_ref6 = null == (w = _globalThis.window) ? void 0 : _flatMaybeArray(_ref7 = _Array$of(5))?.call(_ref7)) || null == (_ref8 = _mapMaybeArray(_ref6)) ? void 0 : _atMaybeArray(_ref9 = _ref8.call(_ref6, x => x))?.call(_ref9, 0);
// the SINGLE-hop spelling converges on the same emission: the mid-chain helper grafts INTO
// the guard alternate and the root guard memo prunes once the claim stops reading it
let w2;
export const nestedCombinedSingle = null == (_ref10 = null == (w2 = _globalThis.window) ? void 0 : _flatMaybeArray(_ref11 = _Array$of(6))?.call(_ref11)) || null == (_ref12 = _mapMaybeArray(_ref10)) ? void 0 : _atMaybeArray(_ref13 = _ref12.call(_ref10, x => x))?.call(_ref13, 0);
// inside a FUNCTION scope the dead root memo prunes too: the scoped `var` list drops the
// excised name on both emitters (the flush declaration does not exist there)
export const nestedCombinedScoped = () => {
  var _ref14, _ref16, _ref17, _ref15;
  let w3;
  return null == (_ref14 = null == (w3 = _globalThis.window) ? void 0 : _flatMaybeArray(_ref15 = _Array$of(7))?.call(_ref15)) || null == (_ref16 = _mapMaybeArray(_ref14)) ? void 0 : _atMaybeArray(_ref17 = _ref16.call(_ref14, x => x))?.call(_ref17, 0);
};
// a SECOND kept chain nested in the claim's ARGUMENT keeps its own guard and claims - the
// composed needle carries the nested chain's live `?.` (only the outer chain's hops deopt)
let a;
let b;
export const nestedKeptArg = null == (a = _globalThis.window) ? void 0 : _flatMaybeArray(_ref18 = _Array$of(null == (b = _globalThis.window) ? void 0 : _nameMaybeFunction(_Set)))?.call(_ref18);