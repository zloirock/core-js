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
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
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
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.replace-all";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a for-of HEAD rebinds the alias to each element of an array-literal iterable: every
// element is a reachable receiver past the loop, so its statics join the union. a distinct
// method-module per row attributes each head form; rows probe uniquely-attributable STATICS -
// an instance method would inject from the bare constructor value-read alone, vacuously
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
  z: Promise
}]]) {
  break;
}
Z.try(() => 1);

// multi-element positional heads pair each name to its own slot
let A3 = Object,
  B3 = Object;
for ([A3, B3] of [[Promise, Iterator]]) {
  break;
}
A3.race([]);
B3.from(other);

// a slot DEFAULT is a possible value too (fires on the undefined element)
let D = Object;
for ([D = Symbol] of [[undefined]]) {
  break;
}
D.for('k');

// sequence wrappers are value-transparent: the iterable and each element peel to their
// tails, the prefix effects stay verbatim in source
let T1 = Object;
for (T1 of (eff(), [Promise])) {
  break;
}
T1.withResolvers();
let T2 = Object;
for (T2 of [(eff(), Reflect)]) {
  break;
}
T2.ownKeys(x);

// a for-IN head yields string keys, and no string carries this static - the row injects NOTHING
// (isolated probe; its key is chosen to collide with no other row)
let K = Object;
for (K in {
  a: 1
}) {
  break;
}
K.fromAsync([4]);

// an OPAQUE iterable enumerates no value the resolver can name, so the rebound alias may hold
// ANYTHING at the use - including a string, whose instance method needs the polyfill off target.
// the declarator's resolved `Object` describes only the pre-loop value, so the typeless instance
// row rides beside it (over-inject-safe); locking "injects nothing" here assumed the unresolvable
// rebind could not dispatch an instance method
let V = Object;
for (V of gen()) {
  break;
}
V.replaceAll(other);