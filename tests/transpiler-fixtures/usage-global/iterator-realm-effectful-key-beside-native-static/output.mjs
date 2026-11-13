import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
// An effectful iterator key stays native when its realm sibling keeps the host.
const {
  Map: {
    [(effect(), Symbol.iterator)]: iterator
  },
  Object: {
    fromEntries
  }
} = globalThis;
export { iterator, fromEntries };