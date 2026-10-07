import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global the selections stay as written: each live operand injects its own family, and a
// dead right injects nothing - the right the pure mirror drops.
let n = 0;
const [held] = [null];
function arm(o) {
  const {
    A: {
      from
    } = c ? Iterator || Uint8Array : WeakSet
  } = o;
  return from;
}
const {
  B: {
    groupBy
  }
} = {
  B: c ? Object : Map || Set
};
function effectInRight(o) {
  const {
    C: {
      withResolvers
    } = Promise || (n++, WeakMap)
  } = o;
  return withResolvers;
}
function liveRight(o) {
  const {
    D: {
      fromEntries
    } = maybe || Object
  } = o;
  return fromEntries;
}
function heldLeft(o) {
  const {
    E: {
      of
    } = held || Array
  } = o;
  return of;
}
export { arm, groupBy, effectInRight, liveRight, heldLeft, n };