import "core-js/modules/es.global-this";
// BinaryIn RHS via proxy-global member chain: `'from' in globalThis.Array`. RHS
// resolves to Array constructor through globalThis indirection, but plugin doesn't
// fold the in-expression (the chain isn't statically reduced for in-fold purposes -
// only direct identifier RHS triggers the fold). plugin registers `es.global-this`
// for the proxy-global polyfill; in-expression remains as-is at runtime
'from' in globalThis.Array;