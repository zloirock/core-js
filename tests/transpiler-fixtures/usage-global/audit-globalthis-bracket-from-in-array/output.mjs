import "core-js/modules/es.global-this";
// computed-key BinaryIn LHS through a proxy global: `globalThis['from'] in Array`.
// LHS string-literal access via globalThis chain doesn't fold to a polyfill candidate
// (the key resolves to runtime value, not the static `'from'` key on Array). plugin
// registers only the proxy-global polyfill (`es.global-this`) for the chain itself,
// no fold-to-true rewrite of the in-expression
globalThis['from'] in Array;