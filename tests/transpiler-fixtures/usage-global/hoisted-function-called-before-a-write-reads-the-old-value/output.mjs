import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
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
import "core-js/modules/es.string.at";
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
// a function declaration is created when its scope is entered, so a call ahead of a write reads what
// the binding held before it: the modules of both values stay - for a constructor, for a key, and for
// a write a later one overwrites after a second call. a function first used after the write reads the
// written value alone
let Ctor = Iterator;
export const early = readCtor();
Ctor = Array;
export function readCtor() {
  return Ctor.from([1]);
}
let key = 'flat';
export const earlyKey = readKey([[1]]);
if (flag) key = 'at';else key = 'at';
export function readKey(list) {
  return list[key](0);
}
let lateCtor = Object;
lateCtor = Map;
export const late = readLate();
export function readLate() {
  return lateCtor.groupBy([1], x => x);
}
let twice = Math;
twice = Array;
export const first = readTwice();
twice = Int16Array;
export const second = readTwice();
twice = Math;
export function readTwice() {
  return twice.of(1);
}