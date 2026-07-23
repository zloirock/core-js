import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2, _ref3;
// DOUBLE-paren-wrapped assignment as the root of an optional proxy chain. the AST emitter reprints
// no redundant parens, so the guard root `_ref = ...` must spell the bare assignment (`n = gw`), NOT
// keep a leftover paren (`(n = gw)`) - a paren nest that bottoms out at a plain expression peels FULLY,
// matching babel. contrast the single-paren line: it already peeled, and the doubled ones now match it.
// a `.name` (MaybeFunction get) tail routes through the guard-root speller; distinct ctor + method per line.
let n, s, w;
const gw = _globalThis;
export const doubleMapHas = null == (_ref = n = gw) ? void 0 : _nameMaybeFunction(_Map.prototype.has);
export const doubleSetAdd = null == (_ref2 = s = gw) ? void 0 : _nameMaybeFunction(_Set.prototype.add);
export const singleWeakGet = null == (_ref3 = w = gw) ? void 0 : _nameMaybeFunction(_WeakMap.prototype.get);