// shadowed proxy global - the parameter `globalThis` is the local binding, not the host's
// proxy global. const-alias init follows `globalThis` upwards to the param shape (Identifier
// binding, NOT VariableDeclarator), so followLocalBindingToProxyGlobal bails. asSymbolRef
// rejects g.Symbol; no polyfill subsumption fires
function f(globalThis) {
  const g = globalThis;
  return g.Symbol.iterator in arr;
}
[f];