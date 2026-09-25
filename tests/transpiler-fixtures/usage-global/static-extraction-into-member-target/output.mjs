import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
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
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a receiver-less static extracted off a call into a MEMBER target: the target takes the polyfill
// like a binding would - beside an instance sibling that reads the call's value, in either order, and
// beside a second member target or a binding, which the residual count sees as surely as a binding
function make() {
  log();
  return Iterator;
}
function makeArray() {
  log();
  return Array;
}
function makePromise() {
  log();
  return Promise;
}
const ob = {};
({
  from: ob.a
} = make());
let sn;
({
  concat: ob.b,
  name: sn
} = make());
({
  name: ob.n,
  zip: ob.c
} = make());
({
  from: ob.d,
  of: ob.e
} = makeArray());
let x;
({
  try: x,
  withResolvers: ob.f
} = makePromise());
use(ob, sn, x);