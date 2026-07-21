import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref;
// a prototype-placement ctor claim over a CHAIN-ASSIGN root harvests the kept assignment
// exactly like a sequence prefix (`(k++, _Map).prototype`): the fallback used to bail on the
// assignment and strand the raw proxy hop (`.self` unponyfilled off-engine). distinct
// constructors per line
let n;
export const nonOptionalKept = _nameMaybeFunction((n = _globalThis.window, _Map).prototype.has);
let g;
export const resolvableKept = _nameMaybeFunction((g = _globalThis, _Set).prototype.add);
let k = 0;
export const seSequenceControl = _nameMaybeFunction((k++, _WeakMap).prototype.get);
// the OPTIONAL twin keeps its root guard; the ctor claim rides the receiver-independent
// body verbatim (`_Map.prototype.has`) - the kept assign lives once, in the guard memo
let o;
export const optionalKept = null == (_ref = o = _globalThis.window) ? void 0 : _nameMaybeFunction(_Map.prototype.has);
// a call tail with NO polyfillable meta above the fallback still keeps the root guard: the
// fold ate it before (`(c = gw, _Set).prototype.has.call(x)` returned a live value where
// native short-circuits to undefined on the absent window)
let c;
export const optionalKeptCall = null == (c = _globalThis.window) ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);
// the ALIAS-valued root guards through its verbatim slice (no raw global inside the assign)
const w2 = _globalThis.window;
let a;
export const optionalAliasCall = null == (a = w2) ? void 0 : _WeakMap.prototype.get.call(new _WeakMap(), {});
// a bare non-polyfilled static read under the same root rides the guarded claim
let m;
export const optionalStaticMiss = null == (m = _globalThis.window) ? void 0 : _Promise.noSuchStatic;
// a TS cast around the kept root: the fallback guard slices the bare assignment (both
// emitters), while a guard-ref rebuild keeps the wrapper INSIDE the memo
let tc;
export const optionalCastCall = null == (tc = _globalThis.window) ? void 0 : _Map.prototype.get.call(new _Map([[1, 2]]), 1);
export const plainControl = _nameMaybeFunction(_WeakSet.prototype.delete);