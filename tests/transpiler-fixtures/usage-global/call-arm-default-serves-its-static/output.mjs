import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a DEFAULT selecting between a CALL and a constructor (`= f() || Set`) serves the static read through
// it off the call's value when that value can never be falsy, and runs the call only where the default
// fires - a nested level, a nullish selection, a top-level host, behind a sequence, and a parameter
function f() {
  log();
  return Map;
}
function g() {
  log();
  return Promise;
}
function k() {
  log();
  return Iterator;
}
function m() {
  log();
  return Object;
}
function h1(o) {
  const {
    M: {
      groupBy: s
    } = f() || Set
  } = o;
  return s;
}
function h2(o) {
  const {
    P: {
      try: t
    } = g() ?? Set
  } = o;
  return t;
}
const {
  I: {
    from: i3
  } = k() || Set
} = {};
function h4(o) {
  const {
    O: {
      fromEntries: e
    } = (n++, m()) || Set
  } = o;
  return e;
}
function h5({
  P: {
    withResolvers: w
  } = g() || Set
} = {}) {
  return w;
}
function h6({
  concat: c
} = k() || Set) {
  return c;
}
use(h1, h2, i3, h4, h5, h6);