// a for-of HEAD rebinds the alias to each element of an array-literal iterable: every
// element is a reachable receiver past the loop, so its statics join the union. a distinct
// method-module per row attributes each head form; rows probe uniquely-attributable STATICS -
// an instance method would inject from the bare constructor value-read alone, vacuously
let M = Object;
for (M of [Array]) { break; }
M.from([1]);

var N = Object;
for (var N of [Iterator]) { break; }
N.from([2].values());

let P = Object;
for ([P] of [[Map]]) { break; }
P.groupBy(x, k);

let Q = Object;
for ({ q: Q } of [{ q: Promise }]) { break; }
Q.allSettled([]);

async function fa() {
  let W = Object;
  for await (W of [Array]) { break; }
  W.of(3);
}
fa();

// a NESTED pattern head pairs through inner slots too
let Z = Object;
for ([{ z: Z }] of [[{ z: Promise }]]) { break; }
Z.try(() => 1);

// multi-element positional heads pair each name to its own slot
let A3 = Object, B3 = Object;
for ([A3, B3] of [[Promise, Iterator]]) { break; }
A3.race([]);
B3.concat([]);

// a slot DEFAULT is a possible value too (fires on the undefined element)
let D = Object;
for ([D = Symbol] of [[undefined]]) { break; }
D.for('k');

// sequence wrappers are value-transparent: the iterable and each element peel to their
// tails, the prefix effects stay verbatim in source
let T1 = Object;
for (T1 of (eff(), [Promise])) { break; }
T1.withResolvers();

let T2 = Object;
for (T2 of [(eff(), Reflect)]) { break; }
T2.ownKeys(x);

// negatives: a for-IN head yields string keys and an OPAQUE iterable enumerates nothing -
// a rebound-but-unresolvable binding injects NOTHING for its keyed member (isolated probes;
// same-module noise in this file can only come from other rows' constructor value reads,
// so both negative keys are chosen to collide with no other row)
let K = Object;
for (K in { a: 1 }) { break; }
K.fromAsync([4]);

let V = Object;
for (V of gen()) { break; }
V.replaceAll(other);
