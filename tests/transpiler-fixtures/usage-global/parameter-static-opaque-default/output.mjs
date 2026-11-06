import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A shadowed default cannot name a static, but a known caller still supplies Array.of.
// Only the selected static is needed; a missing element keeps the custom default.
export function outer(Array) {
  function read([{
    of
  } = Array], value) {
    return of(value);
  }
  return [read([globalThis.Array], 1), read([undefined], 2)];
}