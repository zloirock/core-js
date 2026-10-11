import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an alias reads its source where it is declared, so a `var` of the same name in a block of a function the
// use stands in - hoisted to that function, not to the alias - does not shadow that read: the alias still
// holds the global, read directly, in a closure or as a destructure source
const B = Array;
export function direct(c) {
  if (c) {
    var Array = 1;
  }
  return B.from(xs);
}
const P = Promise;
export function closure(c) {
  if (c) {
    var Promise = 1;
  }
  return () => P.resolve(1);
}
const I = Iterator;
export function destructured(c) {
  if (c) {
    var Iterator = 1;
  }
  const {
    from
  } = I;
  return from(xs);
}