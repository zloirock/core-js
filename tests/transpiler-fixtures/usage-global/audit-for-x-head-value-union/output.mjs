import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a for-of HEAD rebinds the alias to each element of an array-literal iterable: every
// element is a reachable receiver past the loop, so its statics join the union. distinct
// method per row attributes each head form
let M = Object;
for (M of [Array]) {
  break;
}
M.from([1]);
var N = Object;
for (var N of [Iterator]) {
  break;
}
N.from([2].values());
let P = Object;
for ([P] of [[Map]]) {
  break;
}
P.groupBy(x, k);
let Q = Object;
for ({
  q: Q
} of [{
  q: Promise
}]) {
  break;
}
Q.allSettled([]);
async function fa() {
  let W = Object;
  for await (W of [Array]) {
    break;
  }
  W.of(3);
}
fa();

// a NESTED pattern head pairs through inner slots too
let Z = Object;
for ([{
  z: Z
}] of [[{
  z: Set
}]]) {
  break;
}
Z.union(other2);

// multi-element positional heads pair each name to its own slot
let A3 = Object,
  B3 = Object;
for ([A3, B3] of [[Promise, Iterator]]) {
  break;
}
A3.race([]);
B3.concat([]);

// a slot DEFAULT is a possible value too (fires on the undefined element)
let D = Object;
for ([D = Symbol] of [[undefined]]) {
  break;
}
D.for('k');

// sequence wrappers are value-transparent: the iterable and each element peel to their
// tails, the prefix effects stay verbatim in source
let T1 = Object;
for (T1 of (eff(), [WeakMap])) {
  break;
}
T1.getOrInsert(k, v);
let T2 = Object;
for (T2 of [(eff(), Reflect)]) {
  break;
}
T2.ownKeys(x);

// negatives: a for-IN head yields string keys and an OPAQUE iterable enumerates nothing -
// a rebound-but-unresolvable binding injects NOTHING for its keyed member (isolated probes;
// same-module noise in this file can only come from other rows' constructor value reads,
// so both negative keys are chosen to collide with no other row)
let K = Object;
for (K in {
  a: 1
}) {
  break;
}
K.fromAsync([4]);
let V = Object;
for (V of gen()) {
  break;
}
V.replaceAll(other);