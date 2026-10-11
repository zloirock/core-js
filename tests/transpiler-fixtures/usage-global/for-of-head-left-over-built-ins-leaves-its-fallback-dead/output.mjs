import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
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
// a `||` / `??` whose left is a for-of head over an inline literal - the head itself, of any declaration
// kind, or a pattern head's slot of an element written in place - read in the loop's body holds one element
// per pass: where every element is a built-in the right never runs and loads nothing. a head that may hold
// anything else keeps it: an element that may be falsy, a written or shadowed binding, a container read by
// name, a read before the head ran, an element reading the head itself. the loops bring the iteration
// modules and each element its family
for (const M of [Map, Array]) use((M || Object).groupBy);
for (const S of [Set, Array]) use((S ?? Object).fromEntries);
for (const [P] of [[Promise], [Array]]) use((P || Object).hasOwn);
for (const {
  C
} of [{
  C: Map
}, {
  C: Array
}]) use((C || Object).is);
for (var V of [Map, Set]) use((V || Object).freeze);
for (const N of [Map, shim]) use((N || Object).assign);
for (let W of [Set, Array]) {
  if (c) W = null;
  use((W || Object).getOwnPropertyDescriptors);
}
for (const I of [Iterator, Array]) {
  let I = pick();
  use((I || Object).isSealed);
}
for (const F of [Map, Set]) use(F => (F || Object).seal);
const box = {
  C: Promise
};
box.C = null;
for (const {
  C
} of [box]) use((C || Object).getOwnPropertyNames);
for (var Q of [(use((Q || Object).isFrozen), Map), Set]) use(Q);
for (const Y of [Y]) use((Y || Object).isExtensible);