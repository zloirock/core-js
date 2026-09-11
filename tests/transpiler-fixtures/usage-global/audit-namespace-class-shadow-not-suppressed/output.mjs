import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `class` declared inside a namespace block is scoped to that namespace, so the outside
// `new Set().union(...)` is the real global. the over-hoist guard drops the over-hoisted namespace
// class for the outside use so the Set instance polyfills are injected
namespace N {
  export class Set {
    size = 0;
  }
}
new Set().union([1]);