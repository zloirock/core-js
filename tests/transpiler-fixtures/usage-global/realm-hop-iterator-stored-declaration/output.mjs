import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A stored declaration keeps its effects while the iterator helper owns the read.
let held;
const {
  globalThis: {
    Array: {
      prototype: {
        [Symbol.iterator]: iterator
      }
    },
    Object: object
  }
} = (effect(), held = globalThis);
export { held, iterator, object };