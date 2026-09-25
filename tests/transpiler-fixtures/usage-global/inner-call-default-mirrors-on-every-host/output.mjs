import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a static read through a pattern level whose DEFAULT is a call (`{ M: { groupBy } = f() }`): the call
// runs exactly when the default fires, so the level mirrors it on every host instead of reading the
// receiver the value may hold or flattening the read away
function f() {
  log();
  return Map;
}
function mkPromise() {
  log();
  return Promise;
}
function mkIterator() {
  log();
  return Iterator;
}
function h(o) {
  const {
    M: {
      groupBy: s
    } = f()
  } = o;
  return s;
}
const {
  P: {
    try: t
  } = mkPromise()
} = {};
let a;
({
  I: {
    from: a
  } = mkIterator()
} = source);
use(h, t, a);