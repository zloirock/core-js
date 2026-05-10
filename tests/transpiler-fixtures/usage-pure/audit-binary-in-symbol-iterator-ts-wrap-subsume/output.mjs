import _isIterable from "@core-js/pure/actual/is-iterable";
// well-known symbol membership probe with TS cast wrapping the proxy-global root;
// the outer iterator helper subsumes the chain, the wrapper must not trigger a
// duplicate polyfill pass on the inner globalThis identifier
declare const arr: number[];
const r = _isIterable(arr);
[r];