import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/es.math.f16round";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// an init that RUNS code is evaluated once, before any binding, and the extractions then bind in
// SOURCE order whichever prop empties the host - a declaration, an assignment, a member target, an
// export, a sibling declarator, and behind a sequence or a getter-read prefix
class K {
  static get g() {
    log();
    return 0;
  }
}
function mkArray() {
  log();
  return Array;
}
function mkObject() {
  log();
  return Object;
}
function mkIterator() {
  log();
  return Iterator;
}
function mkPromise() {
  log();
  return Promise;
}
function mkMath() {
  log();
  return Math;
}
const ob = {};
const {
  from: a1,
  of: b1
} = mkArray();
let a2, b2;
({
  fromEntries: a2,
  groupBy: b2
} = mkObject());
({
  from: ob.a,
  concat: ob.b
} = mkIterator());
export const {
  try: a4,
  withResolvers: b4
} = mkPromise();
const z5 = 1,
  {
    sumPrecise: a5,
    f16round: b5
  } = mkMath();
let a6, b6;
({
  fromAsync: a6,
  isArray: b6
} = (n++, mkArray()));
const {
  allSettled: a7,
  any: b7
} = (K.g, mkPromise());
let a8, b8;
({
  entries: a8,
  hasOwn: b8
} = (K.g, mkObject()));
use(a1, b1, a2, b2, ob, a4, b4, z5, a5, b5, a6, b6, a7, b7, a8, b8);