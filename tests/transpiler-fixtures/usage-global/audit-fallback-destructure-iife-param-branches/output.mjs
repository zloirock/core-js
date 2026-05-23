import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
// IIFE-param wrapper around a fromFallback receiver: `(({from} = cond ? Array : Set) => ...)()`.
// without IIFE-param branch lift, per-branch enumeration sees only the AssignmentPattern
// default and misses the call-arg path. both branches must contribute their own polyfill
// so static-method dispatch fires for either runtime-chosen receiver. usage-global twin -
// instead of substituting `_Array$from` / `_Set` bindings, it injects side-effect imports
// for both branches' static-method polyfills
const result = (({
  from
} = cond ? Array : Set) => from([1, 2]))();
result;