import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
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
import "core-js/modules/web.dom-collections.iterator";
// Writes invalidate the returned container proof; named reads cover constructors from the arguments and writes.
// Closed calls do not expose their arguments. An unchanged argument resolves precisely.
function viaMember(box, key, value) {
  box[key] = value;
  return box;
}
function viaBuiltin(box, key, value) {
  Object.defineProperty(box, key, {
    value: value,
    configurable: true
  });
  return box;
}
function viaAlias(box, key, value) {
  const alias = box;
  alias[key] = value;
  return box;
}
function clean(box) {
  return box;
}
export const declinedMember = viaMember({
  M: Array
}, 'M', Map).M.groupBy([1], x => x);
export const declinedBuiltin = viaBuiltin({
  S: Array
}, 'S', Set).S.union(new Set());
export const declinedAlias = viaAlias({
  P: Array
}, 'P', Promise).P.withResolvers();
export const resolved = clean({
  A: Array
}).A.of(2);