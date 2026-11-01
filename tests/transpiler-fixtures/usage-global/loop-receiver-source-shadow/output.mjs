import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Mixed values, a changed loop binding and a shadowed name keep their own receivers.
for (const realm of [globalThis, other]) {
  const {
    Array: {
      prototype: {
        at
      }
    }
  } = realm;
  use(at);
}
for (let realm of [globalThis]) {
  realm = other;
  const {
    Array: {
      prototype: {
        includes
      }
    }
  } = realm;
  use(includes);
}
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