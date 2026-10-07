import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
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
import "core-js/modules/es.math.fround";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.escape";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.sticky";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// A write the census sees withdraws the decision - the slot may hold the user's value - so the right keeps
// its modules: a global core-js patches in place (`Number` off the realm, a bare `Array`) and a static
// (`Math.sumPrecise`) alike, and a key both operands own injects the right's static too
// (`Reflect.getPrototypeOf`); a patched STATIC of the global the left reads leaves the decision standing, and
// the dead right's constructor injects nothing.
if (legacy) Number = MyNumber;
export const integer = (globalThis.Number || WeakSet).isInteger(1);
Array = makeArray();
export const listed = (Array || Iterator).from(list);
Math.sumPrecise = null;
export const summed = (Math.sumPrecise || Math.fround)([1, 2]);
Object = makeObject();
export const {
  getPrototypeOf
} = Object || Reflect;
RegExp.escape = myEscape;
export const escaped = (globalThis.RegExp ?? WeakMap).escape('a.b');