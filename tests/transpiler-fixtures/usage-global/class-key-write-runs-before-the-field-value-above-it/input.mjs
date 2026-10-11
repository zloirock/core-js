// a class evaluates its computed keys before the field values and static blocks the source places above
// them, so a write in a key runs before such a write and never supersedes it: the binding ends holding
// the field's or the block's value, read in a closure or after the class. where the source order is
// the evaluation order, the later write still supersedes the earlier one
let C = Iterator;
class FieldAboveKey {
  static held = (C = Object);
  [(C = Map, 'key')] = 1;
}
export const readField = () => C.groupBy([1], x => x);
let D = Iterator;
class FieldAboveKeyRead {
  static held = (D = Array);
  [(D = Int16Array, 'key')] = 1;
}
export const readAfter = D.of(1);
let E = Iterator;
class BlockAboveKey {
  static { E = Promise; }
  [(E = Map, 'key')] = 1;
}
export const readBlock = () => E.try(() => 1);
let F = Set;
class KeyAboveField {
  [(F = Iterator, 'key')] = 1;
  static held = (F = Array);
}
export const readInOrder = () => F.from([1]);
