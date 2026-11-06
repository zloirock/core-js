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
// IIFE-param wrapper around a conditional-fallback receiver:
// `(({ from } = cond ? Array : Set) => ...)()`. per-branch enumeration must reach the
// AssignmentPattern default's conditional, so both branches contribute their own polyfill
// and static-method dispatch fires for either runtime-chosen receiver. usage-global twin:
// instead of substituting bindings it injects side-effect imports for both branches' polyfills.
const result = (({
  from
} = cond ? Array : Set) => from([1, 2]))();
result;