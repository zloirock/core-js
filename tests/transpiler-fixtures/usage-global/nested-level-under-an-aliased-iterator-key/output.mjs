import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested level under an aliased iterator key reads the iterator method, whose modules the key's own read
// already loads; both emitters load that same set, and the leaf adds no module of its own.
const it = Symbol.iterator;
const {
  [it]: {
    next
  }
} = getList();
export { next };