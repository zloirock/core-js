import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map";
// `?.`-lowered input (a transpiler ran before this plugin): the optional chain arrives as a
// ternary whose TEST assigns a synthetic alias - the trusted-write follow resolves the alias
// through the test (structural read-after-write proof), so claims and typed dispatch light up
// exactly like the unlowered spelling; a window-valued write still claims under the explicit
// guard (the alternate only runs when the value passed it)
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
// Negative controls: repeated or conditional writes require a realm-identity check;
// other values retain their own self slot, including the native throw on undefined.
var _d;
_d = _globalThis;
_d = {};
export const doubleWrite = _d === _globalThis ? _self : _d.self;
var _c;
if (Math.random()) _c = _globalThis;
export const conditionalWrite = _nameMaybeFunction((_c === _globalThis ? _self : _c.self).Array);
// Return and if-test hosts preserve the lowered guard's ordered write.
// A branch-dependent write uses a realm-identity check instead of an unconditional substitution.
export function returnHosted() {
  var _r;
  return (_r = _globalThis) == null ? void 0 : _nameMaybeFunction(_WeakMap);
}
export function ifTestHosted() {
  var _t;
  if ((_t = _globalThis) == null ? void 0 : _nameMaybeFunction(_Symbol)) return 1;
  return 2;
}
export function branchWriteNegative(c) {
  var _b;
  if (c) (_b = _globalThis) == null;
  return _nameMaybeFunction((_b === _globalThis ? _self : _b.self).WeakSet);
}
// boundary spellings: an SE beside the write inside the test still proves the order (the
// sequence is INSIDE the guard slot, not the read's ancestor chain) and re-emits verbatim;
// a logical-assign write (`??=`) declines the follow - it assigns on one path only
let e = 0;
var _q;
export const seBesideWrite = (e++, _q = _globalThis) == null ? void 0 : _nameMaybeFunction(_Reflect$ownKeys);
var _n;
export const logicalAssignNegative = (_n ??= _globalThis) == null ? void 0 : _nameMaybeFunction(_n.Proxy);