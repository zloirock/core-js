import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// `const { Symbol: S = fallback } = globalThis` - destructuring from proxy-global
// with renamed binding and a default value. `S` is recognized as an alias of
// `Symbol`, so `S.iterator in obj` still fires the `is-iterable` polyfill.
const S = _Symbol === void 0 ? () => null : _Symbol;
_isIterable(obj);