import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
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
// usage-global guard: the reach test is gated to usage-pure by its own method check, so the
// over-inject-safe side must keep injecting for every cell whatever the pure side decides
let M = globalThis.Map;
let R = globalThis.Reflect;
let P = globalThis.Promise;
let N = globalThis.Number;
export function sameFn() {
  const g = M.groupBy;
  M = Set;
  return g;
}
export function nestedWrite() {
  const {
    ownKeys: o
  } = R;
  if (o) {
    R = Math;
  }
  return o;
}
// straight-line module scope: the entry happens once, so the write after the read cannot precede it
const settled = P.allSettled;
P = Set;
export { settled };
// no write at all - the init is trivially live
export const integer = N.isInteger;