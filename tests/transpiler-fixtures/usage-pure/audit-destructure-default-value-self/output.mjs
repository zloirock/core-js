import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// Proxy-global alias via `self` (rather than `globalThis`). `const { Symbol: S = null } = self`
// still resolves `S` as the global `Symbol`, so `S.iterator in obj` fires the
// `is-iterable` polyfill.
const S = _Symbol === void 0 ? null : _Symbol;
_isIterable(obj);