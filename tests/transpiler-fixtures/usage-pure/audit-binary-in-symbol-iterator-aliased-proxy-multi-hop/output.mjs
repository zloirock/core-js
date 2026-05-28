import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// multi-hop const-alias chain to globalThis. each VariableDeclarator init points at the
// previous binding; followLocalBindingToProxyGlobal recurses through both hops to reach
// the proxy global, so the leaf still gets subsumed and no inner overlap fires
const a = _globalThis;
const b = a;
const r = _isIterable(arr);
[r];