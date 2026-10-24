import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
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
import "core-js/modules/web.dom-collections.iterator";
// a class evaluates its computed keys before its static field values, so a write in a key reaches a field
// read the source places above it - a receiver alias or a key alias the field reads holds what the key
// stored, and pure keeps the read's candidates rather than the value written before the class. where the
// source order is the evaluation order, the key's write decides on its own
let C;
C = Map;
export class Grouped {
  static byParity = C.groupBy(xs, x => x % 2);
  static [(C = Object, 'k')] = 1;
}
let K;
K = 'from';
export class Made {
  static list = Array[K](xs);
  static [(K = 'of', 'k')] = 1;
}
let D;
D = Promise;
export class InOrder {
  static [(D = Iterator, 'k')] = 1;
  static lifted = D.from(xs);
}