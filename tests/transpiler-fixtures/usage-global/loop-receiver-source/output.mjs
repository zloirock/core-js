import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// The receiver is the lexical loop binding, including a read moved into a closure.
for (const realm of [globalThis]) {
  const {
    Array: {
      prototype: {
        at
      }
    }
  } = realm;
  use(at);
}
for (const realm of [globalThis, globalThis]) {
  const read = () => {
    const {
      Array: {
        prototype: {
          includes
        }
      }
    } = realm;
    return includes;
  };
  use(read());
}
for (const realm of [globalThis]) {
  const {
    Array: {
      prototype: {
        [Symbol.iterator]: iterator
      }
    }
  } = (before(), realm);
  use(iterator);
}
for (const realm of [globalThis]) {
  const {
    WeakSet: {
      [Symbol.iterator]: method
    }
  } = (before(), realm);
  use(method);
}