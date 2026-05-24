// TS-wrapped proxy-global on the optional-chain receiver - `(globalThis as any)?.Array.from`.
// the runtime-as is a no-op wrapper, so the polyfill replacement should consume the `?.`
// just like the bare `globalThis?.Array.from` form. without TS-wrap peel in
// isPolyfillableOptional, the optional check would be preserved as if the receiver were
// a possibly-nullish unknown
(globalThis as any)?.Array.from([1, 2, 3]);
