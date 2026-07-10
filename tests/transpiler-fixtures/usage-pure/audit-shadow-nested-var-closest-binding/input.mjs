// a nested-block `var` hoists to its function scope and SHADOWS an outer same-name binding for
// every use inside that function - the adapter's closest-binding resolution must prefer it over
// the outer binding the scope tracker reports (an outer alias fold verdict would otherwise leak
// in: a wrong symbol fold masks the native undefined read, a proxy-ctor alias fold masks the
// native TypeError on the unassigned path, a user shadow of a destructured ctor alias is ignored).
// an over-hoisted namespace-local class does not shadow, but the nested `var` under it still does.
var iterator = Symbol.iterator;
export const top = [][iterator];
function viaSymbol() {
  { var iterator = {}; }
  return [1][iterator];
}
export const s = viaSymbol();
var G = globalThis;
export const outer = G.Array.from([1]);
function viaCtor(flag) {
  if (flag) { var G = globalThis; }
  return G.Array.from([2]);
}
export const c = [viaCtor(true)];
var { Map: M } = globalThis;
export const viaTop = M.groupBy(['a'], x => x);
function viaShadow() {
  { var M = { groupBy() { return 'user'; } }; }
  return M.groupBy(['b'], x => x);
}
export const u = viaShadow();
export { M };
namespace Outer {
  class WeakSet {}
}
function viaNamespace() {
  { var WeakSet = globalThis.WeakMap; }
  return new WeakSet();
}
export const n = viaNamespace();
// negatives: a declaration INSIDE the var's hoist owner keeps the native view - a same-name
// param, a nearer block `let`, a catch param; and a var inside an INNER function never leaks
// out to shadow the outer alias
export function viaParam(Promise) {
  { var Promise = { resolve: () => 'p' }; }
  return Promise.resolve('x');
}
export function viaNearerLet() {
  { var Symbol = { iterator: 'v' }; }
  {
    let Symbol = { iterator: 'l' };
    return [][Symbol.iterator];
  }
}
export function viaCatch() {
  try { throw 0; } catch (Iterator) {
    { var Iterator = { range: () => 'c' }; }
    return Iterator.range(0, 1);
  }
}
var A = globalThis;
function innerFn() {
  { var A = 1; }
  return A;
}
export const outerStays = A.Array.of(1);
export const innerStays = innerFn();
