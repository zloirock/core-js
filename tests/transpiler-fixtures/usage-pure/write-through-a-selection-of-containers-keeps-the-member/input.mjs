// a member the source writes through - a logical or compound assignment, an update, a delete - reached
// through a selection of containers is the write's target, not a read a guard may split: it stays as the
// source spells it, while a plain read through the same selection takes its guard
const box = flag ? { C: Map } : { C: Object };
box.C.groupBy ||= fallbackGroupBy;
(flag ? { C: Array } : { C: Iterator }).C.from ??= fallbackFrom;
export const removed = delete box.C.fromEntries;
const counters = { C: flag ? Number : Object };
counters.C.EPSILON++;
export const read = box.C.groupBy([1], x => x);
