import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
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
import "core-js/modules/es.typed-array.from";
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
// an instance field's value runs at construction, after the writes the module body below the class makes,
// so no write there supersedes it - a key and a constructor written in such a field keep both values,
// while a write in a static field, run at class evaluation, is superseded by a later one
let key = 'from';
class KeyHolder {
  value = key = 'from';
}
key = 'of';
new KeyHolder();
export const built = Array[key](3);
let Ctor;
class CtorHolder {
  value = Ctor = Map;
}
Ctor = Object;
new CtorHolder();
export const grouped = () => Ctor.groupBy([1], x => x);
let Typed;
class StaticHolder {
  static value = Typed = Iterator;
}
Typed = Int16Array;
export const typed = () => Typed.from([1]);