import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// A `||` whose left is an `&&` or a conditional the build decides to an object literal never runs its
// right: the literal is always truthy. In usage-global the right's constructor brings nothing, whether
// the selection is held in a const or read in place. An undecided `&&` may yield its falsy test, so
// both containers stay live
const box = typeof Symbol != 'undefined' && {
  C: Map
} || {
  C: Object
};
export const held = () => box.C.groupBy([1], x => x);
export const inPlace = x => (typeof Promise != 'undefined' && {
  R: Reflect
} || {
  R: Object
}).R.isExtensible(x);
export const ternary = () => ((typeof WeakMap != 'undefined' ? {
  A: Array
} : null) || {
  A: Int8Array
}).A.of(1);
const open = flag && {
  I: Iterator
} || {
  I: Array
};
export const undecided = () => open.I.from([1]);