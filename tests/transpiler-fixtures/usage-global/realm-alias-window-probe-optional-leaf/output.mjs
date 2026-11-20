import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.cause";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.sticky";
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
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A global read off a realm alias through an optional `window` link pulls its modules whether the
// probe short-circuits or not: the alias of `globalThis` and of `self`, a construct, a `typeof`,
// a computed hop, a backed hop and a plain one each detect the global they read, and a parameter
// shadowing the alias name reads the user's own object. A user slot adds no imports.
const g = globalThis;
const s = self;
export const read = g.window?.Map;
export const viaSelf = s.window?.Error;
export const built = new (g.window?.RegExp)("a");
export const kind = typeof g.window?.Set;
export const slot = g["window"]?.userSlot;
export const computed = g["window"]?.DOMException;
export const backed = g.self?.WeakSet;
export const plain = g.window.SuppressedError;
export function shadowed(g) {
  return g.window?.WeakMap;
}