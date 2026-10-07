import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.disposable-stack.constructor";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
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
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.iterator.zip-keyed";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// In usage-global the selections stay as written; the operand a presence test never takes injects
// nothing through the alias, receiver or pattern reading the selection - the realm-detection idiom
// included - while a test that may answer both ways keeps both operands live.
const root = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window;
export const viaRealm = root.Iterator;
const P = typeof Symbol === 'function' ? Symbol : WeakSet;
export const viaAlias = P.for('key');
export const viaReceiver = (typeof Map === 'undefined' ? Set : Map).groupBy(list, key);
const U = typeof Symbol === 'function' ? maybePromise : Promise;
export const viaUserArm = U.resolve(2);
let g = typeof globalThis !== 'undefined' ? globalThis : window;
if (flag) g = globalThis;
export const viaReassigned = g.URL;
export const {
  DisposableStack: viaFlatSlot
} = typeof globalThis !== 'undefined' ? globalThis : window;
export const {
  WeakMap: viaRest,
  ...realmRest
} = typeof globalThis !== 'undefined' ? globalThis : window;
const C = pick() ? Reflect : DOMException;
export const undecided = C.has(value, key);