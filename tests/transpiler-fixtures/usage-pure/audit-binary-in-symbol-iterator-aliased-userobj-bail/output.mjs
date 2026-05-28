// non-global const alias - init bottoms out on an unbound free identifier (not in the
// proxy-global set), so followLocalBindingToProxyGlobal returns false. asSymbolRef rejects
// `g.Symbol` and no Symbol-X subsumption fires (the in-operator falls through to the
// general property-membership path)
const g = someObj;
const r = g.Symbol.iterator in arr;
[r];