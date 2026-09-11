// `Symbol.unknownKey` - `unknownKey` is not a known static of `Symbol`, so plugin
// falls back to polyfilling the `Symbol` receiver itself and emits
// `_Symbol.unknownKey` (preserving the property access intact).
Symbol.unknownKey;
