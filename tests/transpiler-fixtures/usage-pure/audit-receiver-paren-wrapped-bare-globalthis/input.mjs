// `(globalThis).flat?.(0);` - bare proxy-global Identifier wrapped in parens. direct-
// Identifier path must see through the wrapper (`unwrapNode` peel at receiver source
// dispatch) so the leaf gets the polyfill binding instead of falling through to
// `skipProxyGlobal` which would skip the Identifier visitor entirely.
(globalThis).flat?.(0);
