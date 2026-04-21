import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `Symbol.unknownKey` resolves meta `{object: 'Symbol', key: 'unknownKey', placement: 'static'}`.
// `markHandledObjects` marks the `Symbol` identifier so the visitor doesn't double-polyfill,
// then `resolvePureOrGlobalFallback` recovers: unknownKey isn't in the table, but Symbol is
// a polyfillable global → emit `_Symbol.unknownKey`. validates the "recovery via fallback"
// design for the `markHandledObjects` overreach
_Symbol.unknownKey;