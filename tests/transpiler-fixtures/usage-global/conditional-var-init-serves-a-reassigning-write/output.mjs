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
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
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
import "core-js/modules/es.math.sum-precise";
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
// a `var` initialized in a BRANCH still names the value a later reassigning WRITE takes from it: the
// write keeps its own read, so the init need only be able to have run by then - through a member, a
// container slot, a nested slot, a computed key, an array slot, an else arm and a loop body
let a1 = Set;
function g1() {
  if (on) {
    var ns = globalThis;
  }
  a1 = ns.Array;
}
let a2 = Set;
function g2() {
  if (on) {
    var box = {
      A: Iterator
    };
  }
  a2 = box.A;
}
let a3 = Set;
function g3() {
  if (on) {
    var box = {
      w: {
        P: Promise
      }
    };
  }
  a3 = box.w.P;
}
let a4 = Set;
function g4() {
  if (on) {
    var K = 'Object';
  }
  a4 = globalThis[K];
}
let a5 = Set;
function g5() {
  if (on) {
    var list = [Math];
  }
  a5 = list[0];
}
let a6 = Set;
function g6() {
  if (on) {
    var ns = globalThis;
  } else {
    a6 = WeakMap;
  }
  a6 = ns.Error;
}
let a7 = Set;
function g7() {
  for (const x of [1]) {
    var ns = globalThis;
  }
  a7 = ns.Map;
}
use(g1, g2, g3, g4, g5, g6, g7);
use(a1.from, a2.concat, a3.try, a4.fromEntries, a5.sumPrecise, a6.isError, a7.groupBy);