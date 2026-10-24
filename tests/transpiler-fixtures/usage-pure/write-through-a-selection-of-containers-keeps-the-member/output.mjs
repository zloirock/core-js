import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// a member the source writes through - a logical or compound assignment, an update, a delete - reached
// through a selection of containers is the write's target, not a read a guard may split: it stays as the
// source spells it, while a plain read through the same selection takes its guard
const box = flag ? {
  C: _Map
} : {
  C: Object
};
box.C.groupBy ||= fallbackGroupBy;
(flag ? {
  C: Array
} : {
  C: _Iterator
}).C.from ??= fallbackFrom;
export const removed = delete box.C.fromEntries;
const counters = {
  C: flag ? Number : Object
};
counters.C.EPSILON++;
export const read = (_ref = box.C, _ref === Object ? _Object$groupBy([1], x => x) : _ref.groupBy([1], x => x));