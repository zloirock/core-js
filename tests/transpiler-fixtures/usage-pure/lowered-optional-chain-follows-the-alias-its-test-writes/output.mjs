import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
// `?.`-lowered input (a transpiler ran before this plugin): the optional chain arrives as a ternary whose
// TEST assigns a synthetic alias, and the read past the guard follows that write - plain, chained, in the
// strict spelling, window-valued, beside an effect or as a `??=` over a binding still unset, in any host -
// so claims and typed dispatch light up exactly like the unlowered spelling
var _g;
export const simple = (_g = _globalThis) == null ? void 0 : _nameMaybeFunction(_Set);
var _k;
let g;
export const keptAssign = (_k = g = _globalThis) == null ? void 0 : _nameMaybeFunction(_Map);
var _s;
let w;
export const strictSpec = (_s = w = _globalThis) === null || _s === void 0 ? void 0 : _nameMaybeFunction(_Promise);
var _w;
let v;
export const windowValued = (_w = v = _globalThis.window) == null ? void 0 : _nameMaybeFunction(_Set);
var _a;
export const instanceTail = (_a = _globalThis) == null ? void 0 : _nameMaybeFunction(_atMaybeArray(_a.Array.prototype));
let e = 0;
var _q;
export const seBesideWrite = (e++, _q = _globalThis) == null ? void 0 : _nameMaybeFunction(_Reflect$ownKeys);
var _n;
export const logicalAssignOverUnset = (_n ??= _globalThis) == null ? void 0 : _nameMaybeFunction(_n.Proxy);
export function returnHosted() {
  var _r;
  return (_r = _globalThis) == null ? void 0 : _nameMaybeFunction(_WeakMap);
}
export function ifTestHosted() {
  var _t;
  if ((_t = _globalThis) == null ? void 0 : _nameMaybeFunction(_Symbol)) return 1;
  return 2;
}