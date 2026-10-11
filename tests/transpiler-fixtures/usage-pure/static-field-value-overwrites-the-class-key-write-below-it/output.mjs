import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// a static field value runs after every class key, once, where the class is defined: its write overwrites
// the write of a key below it for a read after the class, in a closure or not. an instance field's value
// runs at construction, and a class a function returns is defined in that function's frame, once per
// call, so a key write below either stays a value the read may observe
let A = _Iterator;
class FieldOverKey {
  static held = A = Object;
  [(A = _Map, 'a')] = 1;
}
export const groupByLater = () => _Object$groupBy([1], x => x);
let B = _Iterator;
class FieldOverKeyRead {
  static held = B = Array;
  [(B = Int16Array, 'b')] = 1;
}
export const ofAfter = _Array$of(1);
let C = _Iterator;
class InstanceFieldOverKey {
  held = C = Array;
  [(C = _Promise, 'c')] = 1;
}
export const tryLater = () => (C === _Promise ? _Promise$try : C.try.bind(C))(() => 1);
let D = _Set;
function define() {
  return class {
    static held = D = Array;
    [(D = _Iterator, 'd')] = 1;
  };
}
define();
export const fromLater = () => (D === Array ? _Array$from : D === _Iterator ? _Iterator$from : D.from.bind(D))([1]);
define();