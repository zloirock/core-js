import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.function.name";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// an extraction beside a SURVIVING residual keeps the source's key order: a member target's setter,
// a user getter the residual reads and a binding written before them all observe it - the ordered
// capture holds every key in its slot where a crossed operation runs code
class C {
  static get name() {
    log();
    return 'C';
  }
  static groupBy = 1;
}
function user() {
  log();
  return C;
}
function effIterator() {
  log();
  return Iterator;
}
function effArray() {
  log();
  return Array;
}
const ob = {
  set a(v) {
    log(v);
  },
  set b(v) {
    log(v);
  },
  set f(v) {
    log(v);
  }
};
({
  from: ob.a,
  name: ob.b
} = effIterator());
let s0, nm;
({
  groupBy: s0,
  name: nm
} = user());
let x;
({
  fromAsync: x,
  isArray: ob.f
} = effArray());
use(s0, nm, x);