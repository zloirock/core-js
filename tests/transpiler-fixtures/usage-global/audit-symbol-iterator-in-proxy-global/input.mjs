// `Symbol.iterator in <array>` through a proxy-global (`globalThis.Symbol`). Resolves to the
// Symbol global behind the proxy, triggering the iterator-protocol polyfill on both plugins.
// parity counterpart to the const-alias and bare forms.
globalThis.Symbol.iterator in [];
