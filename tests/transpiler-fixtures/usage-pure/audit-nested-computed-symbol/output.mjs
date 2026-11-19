import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol[Symbol.iterator]` - outer `Symbol` indexed by the inner `Symbol.iterator`.
// Plugin emits the specialized `get-iterator-method(_Symbol)` polyfill, and the
// outer `Symbol` reference itself is rewritten to `_Symbol` exactly once (no
// double-wrapping to `__Symbol`).
const x = _getIteratorMethod(_Symbol);