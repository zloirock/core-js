import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.with";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// A default on a static the build serves never runs, so like the dead part of a decided selection it is no
// usage: off the constructor, an alias of it, a realm key and in an assignment alike, nothing it reads
// loads. A receiver selecting a constructor without the static may run it, and what it reads loads.
const A = Array;
const {
  from = [].flat()
} = Array;
const {
  of = [].findLast(Boolean)
} = A;
const {
  Object: {
    entries = [].toReversed()
  }
} = globalThis;
let hasOwn;
({
  hasOwn = [].toSorted()
} = Object);
const {
  groupBy = [].with(0, 1)
} = flag ? Map : WeakMap;
export { from, of, entries, hasOwn, groupBy };