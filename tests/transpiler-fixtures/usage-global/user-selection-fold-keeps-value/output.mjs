import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global a decided selection in a callee or tag slot, or under `delete` / `typeof`, stays as
// written - the reference reading the source took is untouched - and its dead branch injects nothing.
export const called = (typeof Promise !== 'undefined' && obj.method)(1);
export const tagged = (typeof Symbol === 'function' ? obj.tag : Iterator.from)`x`;
export const removed = delete (typeof Map === 'undefined' ? WeakSet.prototype.x : obj.prop);
export const removedName = delete (typeof Promise !== 'undefined' ? maybeDeclared : Set);
export const probed = typeof (typeof Promise !== 'undefined' ? maybeDeclared : WeakMap);
export const resolved = (typeof Promise !== 'undefined' ? Promise.resolve : fallback)(1);
export const nestedCalled = (typeof Promise !== 'undefined' ? typeof Symbol === 'function' ? obj.method : URL : queueMicrotask)(1);
export const nestedRemoved = delete (typeof Map === 'undefined' ? DOMException.prototype.x : typeof Promise !== 'undefined' ? obj.prop : DisposableStack.prototype.y);