// `Symbol[Symbol.iterator]` - outer `Symbol` indexed by the inner `Symbol.iterator`.
// Plugin emits the specialized `get-iterator-method(_Symbol)` polyfill, and the
// outer `Symbol` reference itself is rewritten to `_Symbol` exactly once (no
// double-wrapping to `__Symbol`).
const x = Symbol[Symbol.iterator];
