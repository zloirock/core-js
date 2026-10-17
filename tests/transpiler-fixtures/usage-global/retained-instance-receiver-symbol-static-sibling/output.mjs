import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A static sibling's receiver mirror preserves the instance claim under the iterator slot.
// The single function leaf dispatches on the iterator value, with one source iterator lookup.
let iteratorReads = 0;
function iterator() {
  return 7;
}
const iteratorKey = Symbol.iterator;
const previousIterator = Object.getOwnPropertyDescriptor(Array, iteratorKey);
Object.defineProperty(Array, iteratorKey, {
  configurable: true,
  get() {
    iteratorReads++;
    return iterator;
  }
});
try {
  const {
    of,
    [Symbol.iterator]: {
      name
    }
  } = Array;
  console.log(of, name, iteratorReads);
} finally {
  if (previousIterator) Object.defineProperty(Array, iteratorKey, previousIterator);else delete Array[iteratorKey];
}