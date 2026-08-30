import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a value resolved through an alias walk is spelled where the ALIAS lives, so its identifiers
// re-anchor in the alias's own declaration scope - a use-site shadow of a name the value reads
// must not capture it. each row pairs a shadowed use with the injection the unshadowed twin gets,
// and every row carries its OWN method family: injection is observable only through the import
// set, so two rows sharing a method would mask each other's regression

// an inline-callee's returned body resolves in the callee's scope, not at the call site
const factory = () => Array;
export function callSiteShadow(Array) {
  return factory().from([1, 2]);
}

// a reassigned alias's write RHS resolves in the binding's scope, not at the use site
let holder = Object;
holder = String;
export function writeRhsShadow(String) {
  return holder.fromCodePoint(99);
}

// a dead-init reaching value (unconditional overwrite before a closure read) resolves in the
// binding's scope too
let reaching = Object;
reaching = Map;
export function reachingShadow(Map) {
  return () => reaching.groupBy([4], v => v);
}

// NEGATIVE: a destructured binding holds a SLOT of its init, never the container - the alias
// union must not fan the container's values. `cbrt` is a STATIC-only key no other row injects,
// so the row injects `es.math.cbrt` exactly when the walk smuggles the container `Math`
const {
  hypot: extracted
} = Math;
let holder2 = extracted;
holder2 = Object;
export const containerNotSmuggled = holder2.cbrt;

// a const-bound array wrapper reached through a PATTERN slot still descends to its real value
const [wrapper] = [[globalThis]];
export const [{
  Object: {
    fromEntries: viaWrapper
  }
}] = wrapper;
export const wrapperResolved = viaWrapper([['d', 4]]);