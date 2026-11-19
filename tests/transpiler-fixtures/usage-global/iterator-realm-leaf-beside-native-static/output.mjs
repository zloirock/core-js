import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
// A stable iterator leaf beside another realm field takes the same extraction in both hosts.
const {
  Map: {
    [Symbol.iterator]: iterator
  },
  Object: {
    fromEntries
  }
} = globalThis;
export { iterator, fromEntries };