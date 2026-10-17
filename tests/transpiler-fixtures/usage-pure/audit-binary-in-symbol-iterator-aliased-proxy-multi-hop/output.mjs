import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `b.Symbol.iterator in arr` where b aliases a aliases globalThis (two const hops). The
// receiver still resolves to the global, so `Symbol.iterator in arr` collapses to the
// is-iterable polyfill rather than a raw property-membership check.
const a = _globalThis;
const b = a;
const r = _isIterable(arr);
[r];