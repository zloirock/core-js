import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// Proxy-global alias via `self` (rather than `globalThis`). `const { Symbol: S = null } = self`
// still resolves `S` as the global `Symbol`, so `S.iterator in obj` fires the
// `is-iterable` polyfill.
const S = _Symbol === void 0 ? null : _Symbol;
_isIterable(obj);