import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Symbol.iterator in <array>` through a proxy-global (`globalThis.Symbol`). Resolves to the
// Symbol global behind the proxy, triggering the iterator-protocol polyfill on both plugins.
// parity counterpart to the const-alias and bare forms.
globalThis.Symbol.iterator in [];