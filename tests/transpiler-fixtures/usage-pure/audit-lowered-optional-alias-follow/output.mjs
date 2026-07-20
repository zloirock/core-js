import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
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
// negative controls: a second write / a conditional write keep the alias opaque on every path
var _d;
_d = _globalThis;
_d = {};
export const doubleWrite = _d.self;
var _c;
if (Math.random()) _c = _globalThis;
export const conditionalWrite = _nameMaybeFunction(_c.self.Array);
// statement hosts beyond expression/declaration: a return / throw / if-test / while-test hosted
// lowered guard is as unconditional as any statement - the placement walk accepts them, and the
// write in a BRANCH or a loop BODY still refuses (path-dependent)
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
  return _nameMaybeFunction(_b.self.WeakSet);
}
// boundary spellings: an SE beside the write inside the test still proves the order (the
// sequence is INSIDE the guard slot, not the read's ancestor chain) and re-emits verbatim;
// a logical-assign write (`??=`) declines the follow - it assigns on one path only
let e = 0;
var _q;
export const seBesideWrite = (e++, _q = _globalThis) == null ? void 0 : _nameMaybeFunction(_Reflect$ownKeys);
var _n;
export const logicalAssignNegative = (_n ??= _globalThis) == null ? void 0 : _nameMaybeFunction(_n.self.Proxy);