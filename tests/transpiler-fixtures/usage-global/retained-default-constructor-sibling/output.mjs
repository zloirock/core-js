import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Repeated native siblings split the default into ordered reads.
// The constructor beside the static claim still comes from its pure import.
function read({
  Array: {
    from
  },
  Map: M,
  missing: a,
  missing: b
} = globalThis) {
  return [from([7])[0], typeof M, a, b];
}
read();