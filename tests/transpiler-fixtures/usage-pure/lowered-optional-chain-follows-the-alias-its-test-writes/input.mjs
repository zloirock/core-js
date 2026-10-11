// `?.`-lowered input (a transpiler ran before this plugin): the optional chain arrives as a ternary whose
// TEST assigns a synthetic alias, and the read past the guard follows that write - plain, chained, in the
// strict spelling, window-valued, beside an effect or as a `??=` over a binding still unset, in any host -
// so claims and typed dispatch light up exactly like the unlowered spelling
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
let e = 0;
var _q;
export const seBesideWrite = (e++, _q = globalThis) == null ? void 0 : _q.self.Reflect.ownKeys.name;
var _n;
export const logicalAssignOverUnset = (_n ??= globalThis) == null ? void 0 : _n.self.Proxy.name;
export function returnHosted() {
  var _r;
  return (_r = globalThis) == null ? void 0 : _r.self.WeakMap.name;
}
export function ifTestHosted() {
  var _t;
  if ((_t = globalThis) == null ? void 0 : _t.self.Symbol.name) return 1;
  return 2;
}
