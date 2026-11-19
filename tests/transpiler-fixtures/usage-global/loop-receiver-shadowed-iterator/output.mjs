import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An opaque or replaced loop value keeps its own receiver.
// Global pins syntax presence here; the separate at twin observes receiver inference.
for (const realm of [globalThis]) {
  const read = realm => {
    const {
      Array: {
        prototype: {
          [Symbol.iterator]: iterator
        }
      }
    } = realm;
    return iterator;
  };
  use(read(other));
}