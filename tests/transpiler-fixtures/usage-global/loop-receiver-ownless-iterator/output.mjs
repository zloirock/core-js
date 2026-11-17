import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// A loop binding supplies the receiver at this read.
// Global pins syntax presence here; the separate at twin observes receiver inference.
for (const realm of [globalThis]) {
  const {
    WeakSet: {
      [Symbol.iterator]: method
    }
  } = (before(), realm);
  use(method);
}