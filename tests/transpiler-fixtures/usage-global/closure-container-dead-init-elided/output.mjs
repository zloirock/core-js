import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.keys";
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
import "core-js/modules/es.typed-array.int16-array";
import "core-js/modules/es.typed-array.of";
import "core-js/modules/es.typed-array.iterator";
import "core-js/modules/es.typed-array.at";
import "core-js/modules/es.typed-array.copy-within";
import "core-js/modules/es.typed-array.entries";
import "core-js/modules/es.typed-array.every";
import "core-js/modules/es.typed-array.fill";
import "core-js/modules/es.typed-array.filter";
import "core-js/modules/es.typed-array.find";
import "core-js/modules/es.typed-array.find-index";
import "core-js/modules/es.typed-array.find-last";
import "core-js/modules/es.typed-array.find-last-index";
import "core-js/modules/es.typed-array.for-each";
import "core-js/modules/es.typed-array.includes";
import "core-js/modules/es.typed-array.index-of";
import "core-js/modules/es.typed-array.join";
import "core-js/modules/es.typed-array.keys";
import "core-js/modules/es.typed-array.last-index-of";
import "core-js/modules/es.typed-array.map";
import "core-js/modules/es.typed-array.reduce";
import "core-js/modules/es.typed-array.reduce-right";
import "core-js/modules/es.typed-array.reverse";
import "core-js/modules/es.typed-array.set";
import "core-js/modules/es.typed-array.slice";
import "core-js/modules/es.typed-array.some";
import "core-js/modules/es.typed-array.sort";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/es.typed-array.subarray";
import "core-js/modules/es.typed-array.to-locale-string";
import "core-js/modules/es.typed-array.to-reversed";
import "core-js/modules/es.typed-array.to-sorted";
import "core-js/modules/es.typed-array.to-string";
import "core-js/modules/es.typed-array.to-string-tag";
import "core-js/modules/es.typed-array.values";
import "core-js/modules/es.typed-array.with";
import "core-js/modules/es.uint8-array.set-from-base64";
import "core-js/modules/es.uint8-array.set-from-hex";
import "core-js/modules/es.uint8-array.to-base64";
import "core-js/modules/es.uint8-array.to-hex";
import "core-js/modules/web.dom-collections.iterator";
// a container reassigned before the closure reading its slot is defined holds the written one there,
// never the dead init - written unconditionally or under a test the build decides - so the init's
// static is not injected. a write the closure may observe after its definition keeps the init live
let plain = {
  C: Object
};
plain = {
  C: Map
};
export const readPlain = () => plain.C.groupBy([1], x => x);
let decided = {
  C: Array
};
if (typeof Symbol != 'undefined') decided = {
  C: Iterator
};
export const readDecided = () => decided.C.from([1]);
let afterClosure = {
  C: Int16Array
};
export const readAfterClosure = () => afterClosure.C.of(1);
afterClosure = {
  C: Promise
};