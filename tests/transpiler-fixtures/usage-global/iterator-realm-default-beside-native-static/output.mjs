import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
// A native constructor iterator default remains observable beside its realm sibling.
const {
  Map: {
    [Symbol.iterator]: iterator = fallback()
  },
  Object: {
    fromEntries
  }
} = globalThis;
export { iterator, fromEntries };