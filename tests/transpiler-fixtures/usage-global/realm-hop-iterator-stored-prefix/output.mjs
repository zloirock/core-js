import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored realm source keeps its prefix and exposes iterator claims beside residual reads.
let iterator, object, held;
({
  globalThis: {
    Array: {
      prototype: {
        [Symbol.iterator]: iterator
      }
    },
    Object: object
  }
} = (effect(), held = globalThis));
export { iterator, object, held };