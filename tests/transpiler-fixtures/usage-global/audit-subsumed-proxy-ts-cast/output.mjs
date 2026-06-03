import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `(globalThis as any).Symbol.iterator in x`: the TS as-cast wrapper must be unwrapped so the
// chain is recognised as a `globalThis` proxy and the iterator-protocol polyfill fires. usage-global
// keeps the `in` text verbatim, so the surviving `globalThis` leaf also earns `es.global-this`.
function check(x: unknown): boolean {
  return (globalThis as any).Symbol.iterator in x;
}