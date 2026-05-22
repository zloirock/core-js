// SE-tail receiver under an optional-call: `(0, globalThis)?.flat(0)`. the optional
// short-circuit applies to the whole receiver - if it is nullish, the call is skipped.
// receiver tail is a polyfillable proxy-global Identifier; the SE prefix `0,` must
// stay in source verbatim while the inner `globalThis` is substituted by the polyfill
// pure-import, and the optional call lowers to `?.call(_ref, 0)` with memo
(0, globalThis)?.flat(0);
