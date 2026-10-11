import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// a class evaluates its computed keys before the field values and static blocks the source places above
// them, so a write in a key runs before such a write and never supersedes it: the binding ends holding
// the field's or the block's value, read in a closure or after the class. where the source order is
// the evaluation order, the later write still supersedes the earlier one
let C = _Iterator;
class FieldAboveKey {
  static held = C = Object;
  [(C = _Map, 'key')] = 1;
}
export const readField = () => _Object$groupBy([1], x => x);
let D = _Iterator;
class FieldAboveKeyRead {
  static held = D = Array;
  [(D = Int16Array, 'key')] = 1;
}
export const readAfter = _Array$of(1);
let E = _Iterator;
class BlockAboveKey {
  static {
    E = _Promise;
  }
  [(E = _Map, 'key')] = 1;
}
export const readBlock = () => (E === _Promise ? _Promise$try : E.try.bind(E))(() => 1);
let F = _Set;
class KeyAboveField {
  [(F = _Iterator, 'key')] = 1;
  static held = F = Array;
}
export const readInOrder = () => _Array$from([1]);