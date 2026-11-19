import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// TS ELIDES a namespace with no runtime value (empty / type-only / interface-only / a
// non-instantiated nested namespace), so a same-named reference resolves to the GLOBAL and
// the polyfill must fire. only an INSTANTIATED namespace (>=1 value member) lowers to the
// `var N; (function(N){})(N||...)` IIFE that shadows the global

// empty namespace -> elided -> Map is the global
namespace Map {}
export const a = new Map([[1, 2]]);

// type/interface-only namespace -> elided -> WeakMap is the global
namespace WeakMap {
  export type T = number;
  export interface I {
    x: number;
  }
}
export const b = new WeakMap();

// nested non-instantiated namespace -> still elided -> Set is the global
namespace Set {
  export namespace Inner {}
}
export const c = new Set([1, 2]);

// INSTANTIATED namespace (a value member) -> real runtime shadow -> NO polyfill; the read
// resolves the user's namespace member, not a polyfilled constructor
namespace Promise {
  export const resolved = 1;
}
export const d = Promise.resolved;