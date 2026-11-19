import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a class evaluates its computed keys before its static field values, so a write in a key reaches a field
// read the source places above it - a receiver alias or a key alias the field reads holds what the key
// stored, and pure keeps the read's candidates rather than the value written before the class. where the
// source order is the evaluation order, the key's write decides on its own
let C;
C = _Map;
export class Grouped {
  static byParity = (C === _Map ? _Map$groupBy : C === Object ? _Object$groupBy : C.groupBy.bind(C))(xs, x => x % 2);
  static [(C = Object, 'k')] = 1;
}
let K;
K = 'from';
export class Made {
  static list = Array[K](xs);
  static [(K = 'of', 'k')] = 1;
}
let D;
D = _Promise;
export class InOrder {
  static [(D = _Iterator, 'k')] = 1;
  static lifted = _Iterator$from(xs);
}