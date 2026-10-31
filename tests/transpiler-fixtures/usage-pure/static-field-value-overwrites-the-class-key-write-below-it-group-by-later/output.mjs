import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
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