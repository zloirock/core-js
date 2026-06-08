import _globalThis from "@core-js/pure/actual/global-this";
// `(globalThis).flat?.(0);` - bare proxy-global Identifier wrapped in parens. direct-
// Identifier path must see through the wrapper (paren peel at receiver source dispatch)
// so the leaf gets the polyfill binding instead of falling through to the proxy-global
// skip which would skip the Identifier visitor entirely.
_globalThis.flat?.(0);