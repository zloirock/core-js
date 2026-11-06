import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Defaults, rest and patterns do not move the returned slot; effectful defaults keep the call.
// A default that rewrites that slot prevents value substitution, but its closed caller still
// needs only the selected static. Each row reads a distinct method to keep injection observable.
function mark() {
  return 1;
}
function afterDefault(value, n = 1) {
  return value;
}
function afterRest(value, ...rest) {
  return value;
}
function afterPattern(value, {
  k
}) {
  return value;
}
function afterEffect(value, n = mark()) {
  return value;
}
function reboundByDefault(value, n = value = Array) {
  return value;
}
export const inert = afterDefault(Map).groupBy([1], x => x);
export const rested = afterRest(Object, 1).groupBy([2], x => x);
export const patterned = afterPattern(Promise, {
  k: 1
}).withResolvers();
export const effectful = afterEffect(Array).from([3]);
export const declined = reboundByDefault(Promise).of(4);