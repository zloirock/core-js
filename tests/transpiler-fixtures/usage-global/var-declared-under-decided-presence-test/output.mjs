import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global the `var` declarations under presence tests keep their reads as written, and each read
// injects what its binding may hold - `at` through the key, `resolve` through the constructor alias, both
// `Array` statics through the undecided pair; the iterator key's read adds nothing to the modules
// `Symbol.iterator` loads where it is written
if (typeof Symbol != 'undefined') var guarded = 'at';
export const first = list => list[guarded](0);
if (typeof Promise != 'undefined') var Ctor = Promise;
export const resolved = () => Ctor.resolve(1);
if (typeof Symbol === 'function') {
  var ITER = Symbol.iterator;
} else {
  var ITER = '@@iterator';
}
export function getIter(o) {
  return o[ITER];
}
if (flag) var either = 'of';else var either = 'from';
export const pick = list => Array[either](list);