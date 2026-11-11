import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A realm hop peels before an iterator capture reads its slot beside a residual.
let iterator, object;
({
  globalThis: {
    Array: {
      prototype: {
        [Symbol.iterator]: iterator
      }
    },
    Object: object
  }
} = globalThis);
export { iterator, object };