import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Inner symbol claims share the stored guarded receiver with the residual.
// The native capture keeps the store, prefix and receiver read single-evaluated.
let held;
const {
  Map: {
    [Symbol.iterator]: iterator,
    missing = fallback()
  }
} = held = (record(), globalThis.window?.self);
use(held, iterator, missing);