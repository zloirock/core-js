// The parameter named `globalThis` shadows the real global, so `g` aliases a local binding,
// not the host global. `g.Symbol.iterator in arr` is therefore NOT the global iterator probe
// and must stay a plain `in` check with no polyfill subsumption.
function f(globalThis) {
  const g = globalThis;
  return g.Symbol.iterator in arr;
}
[f];
