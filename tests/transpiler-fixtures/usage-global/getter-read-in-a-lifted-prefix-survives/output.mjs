import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.cause";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
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
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a sequence prefix element that READS through a getter (`K.g`) is work the source does, not a dead
// value: every channel that lifts or trims a destructure's prefix keeps it, in the order the source
// ran it - beside a sibling declarator, exported, in a loop head, ahead of a memo, in a bodyless slot,
// under an array wrapper, and behind a residual that keeps the realm
class K {
  static get g() {
    log();
    return 0;
  }
}
function mkMap() {
  log();
  return Map;
}
const z1 = 1,
  {
    from: a1,
    foo: b1
  } = (K.g, Array);
export const z2 = 1,
  {
    of: a2,
    foo: b2
  } = (K.g, Array);
for (const {
  fromEntries: a3,
  foo: b3
} = (K.g, Object);;) break;
const {
  from: a4,
  name: nm4
} = (K.g, Iterator);
if (c) var {
  try: a5
} = (K.g, Promise);
if (c) var z6 = 1,
  {
    isError: a6
  } = (K.g, Error);
const {
  groupBy: a7
} = (K.g, mkMap());
const [{
  fromAsync: m8
}, z8] = [(K.g, Array), 1];
const {
  Set: S9,
  foo: b9
} = (K.g, globalThis);
use(z1, a1, b1, a3, b3, a4, nm4, a5, z6, a6, a7, m8, z8, S9, b9);