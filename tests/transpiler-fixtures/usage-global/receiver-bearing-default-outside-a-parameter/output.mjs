import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
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
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a nested default that CARRIES the receiver: the outer slot is unknown, so what runs when it is
// undefined IS the default - and a mirror of that default fires under exactly the same condition,
// which makes it correct on every host, not only in a parameter list. one static per host so a
// dropped host is visible in the import set. the last three are controls: a proxy-global receiver
// still resolves through the OUTER chain and flattens, a default carrying no receiver stays native,
// and a resolvable outer chain leaves its dead default alone
const src = {};
const flag = true;
const list = [];
function use() {/* empty */}
function raise() {/* empty */}
const {
  a: {
    from
  } = Array
} = src;
let entries;
({
  b: {
    entries
  } = Object
} = src);
try {
  raise();
} catch ({
  c: {
    allSettled
  } = Promise
}) {
  use(allSettled);
}
for (const {
  d: {
    isFinite
  } = Number
} of list) use(isFinite);
const {
  e: {
    f: {
      groupBy
    } = Map
  }
} = src;
export const {
  g: {
    raw
  } = String
} = src;
const {
  Array: {
    of
  } = {}
} = globalThis;
const {
  h: {
    plain
  } = {}
} = src;
const {
  Set: {
    union
  } = Set
} = globalThis;
// a BRANCHY default declines: this channel answers with a receiver NAME, and a name cannot say
// "either branch" - mirroring one of them would emit the wrong branch's static whenever the other
// fires. the flat twin affords these shapes only because its meta carries a fallback flag
const {
  b1: {
    from: fromOr
  } = Array || Iterator
} = src;
const {
  b2: {
    from: fromTernary
  } = flag ? Array : Iterator
} = src;
// the same rule on an INSTANCE receiver: the default is the receiver, so the mirror carries the
// bound helper and the caller's own object still destructures natively. the last row is the
// control - a receiver the shared shape gate rejects (a call, which re-evaluating would repeat)
// keeps the whole form native
const {
  i1: {
    flat
  } = list
} = src;
function withDefault({
  i2: {
    includes
  } = list
} = {}) {
  return includes;
}
const {
  i3: {
    at
  } = raise()
} = src;
use(from, entries, of, plain, union, groupBy, flat, at, withDefault(), fromOr, fromTernary);