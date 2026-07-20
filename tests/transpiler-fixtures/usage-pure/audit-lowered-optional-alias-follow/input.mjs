// `?.`-lowered input (a transpiler ran before this plugin): the optional chain arrives as a
// ternary whose TEST assigns a synthetic alias - the trusted-write follow resolves the alias
// through the test (structural read-after-write proof), so claims and typed dispatch light up
// exactly like the unlowered spelling; a window-valued write still claims under the explicit
// guard (the alternate only runs when the value passed it)
var _g;
export const simple = (_g = globalThis) == null ? void 0 : _g.self.Set.name;
var _k;
let g;
export const keptAssign = (_k = g = globalThis) == null ? void 0 : _k.self.Map.name;
var _s;
let w;
export const strictSpec = (_s = w = globalThis) === null || _s === void 0 ? void 0 : _s.self.Promise.name;
var _w;
let v;
export const windowValued = (_w = v = globalThis.window) == null ? void 0 : _w.self.Set.name;
var _a;
export const instanceTail = (_a = globalThis) == null ? void 0 : _a.self.Array.prototype.at.name;
// negative controls: a second write / a conditional write keep the alias opaque on every path
var _d;
_d = globalThis;
_d = {};
export const doubleWrite = _d.self;
var _c;
if (Math.random()) _c = globalThis;
export const conditionalWrite = _c.self.Array.name;
// statement hosts beyond expression/declaration: a return / throw / if-test / while-test hosted
// lowered guard is as unconditional as any statement - the placement walk accepts them, and the
// write in a BRANCH or a loop BODY still refuses (path-dependent)
export function returnHosted() {
  var _r;
  return (_r = globalThis) == null ? void 0 : _r.self.WeakMap.name;
}
export function ifTestHosted() {
  var _t;
  if ((_t = globalThis) == null ? void 0 : _t.self.Symbol.name) return 1;
  return 2;
}
export function branchWriteNegative(c) {
  var _b;
  if (c) (_b = globalThis) == null;
  return _b.self.WeakSet.name;
}
// boundary spellings: an SE beside the write inside the test still proves the order (the
// sequence is INSIDE the guard slot, not the read's ancestor chain) and re-emits verbatim;
// a logical-assign write (`??=`) declines the follow - it assigns on one path only
let e = 0;
var _q;
export const seBesideWrite = (e++, _q = globalThis) == null ? void 0 : _q.self.Reflect.ownKeys.name;
var _n;
export const logicalAssignNegative = (_n ??= globalThis) == null ? void 0 : _n.self.Proxy.name;
