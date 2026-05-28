// multi-hop const-alias chain to globalThis. each VariableDeclarator init points at the
// previous binding; followLocalBindingToProxyGlobal recurses through both hops to reach
// the proxy global, so the leaf still gets subsumed and no inner overlap fires
const a = globalThis;
const b = a;
const r = b.Symbol.iterator in arr;
[r];
