import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol.unknownKey` - `unknownKey` is not a known static of `Symbol`, so plugin
// falls back to polyfilling the `Symbol` receiver itself and emits
// `_Symbol.unknownKey` (preserving the property access intact).
_Symbol.unknownKey;