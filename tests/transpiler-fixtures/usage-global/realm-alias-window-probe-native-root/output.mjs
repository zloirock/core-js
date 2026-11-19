import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.iterator.zip-keyed";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
// On targets carrying `globalThis` and `self` natively a realm alias keeps the native name and is
// still the realm: reads and deletes through its optional `window` link detect the globals they
// navigate, while a parameter shadowing the alias name reads the user's own object.
const g = globalThis;
const s = self;
export const read = g.window?.Iterator;
export const deep = s.window?.self.Map;
export const call = g.window?.Promise.withResolvers();
export const removed = delete g.window?.Set.userKey;
export const removedSlot = delete s.window?.userSlot;
export const removedHop = delete g.window?.self.userKey;
export function shadowed(g) {
  return delete g.window?.WeakMap.userKey;
}