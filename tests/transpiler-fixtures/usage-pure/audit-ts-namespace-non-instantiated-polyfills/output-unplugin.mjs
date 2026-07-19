import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// TS ELIDES a namespace with no runtime value (empty / type-only / interface-only / a
// non-instantiated nested namespace), so a same-named reference resolves to the GLOBAL and
// the polyfill must fire. only an INSTANTIATED namespace (>=1 value member) lowers to the
// `var N; (function(N){})(N||...)` IIFE that shadows the global

// empty namespace -> elided -> Map is the global
namespace Map {}
export const a = new _Map([[1, 2]]);

// type/interface-only namespace -> elided -> WeakMap is the global
namespace WeakMap {
  export type T = number;
  export interface I { x: number }
}
export const b = new _WeakMap();

// nested non-instantiated namespace -> still elided -> Set is the global
namespace Set {
  export namespace Inner {}
}
export const c = new _Set([1, 2]);

// INSTANTIATED namespace (a value member) -> real runtime shadow -> NO polyfill; the read
// resolves the user's namespace member, not a polyfilled constructor
namespace Promise {
  export const resolved = 1;
}
export const d = Promise.resolved;