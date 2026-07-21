// a spread contributes an unknown NUMBER of items, so the slot a later index pairs with is not
// the literal sitting there: the enumerated candidates are an incomplete over-approximation and
// a precision-needing consumer must not read a lone candidate as certain. that holds just as well
// when the shifted array sits under an object key, or nested deeper
const tail = [];
const { x: [, Shifted] } = { x: [...tail, Object] };
export const shifted = Shifted.groupBy([1, 2], x => x);
const { x: { y: [, Deep] } } = { x: { y: [...tail, Promise] } };
export const deep = Deep.try(() => 1);
// a COMPUTED key must be read through the same canon the value pairing uses, or the shift goes
// unnoticed on exactly the slot that did pair a value
const key = "x";
const { [key]: [, Computed] } = { x: [...tail, Array] };
export const computed = Computed.fromAsync([2]);
// WITHOUT a spread every index pairs exactly and the nested slot keeps its narrow, computed or not
const { x: [, Exact] } = { x: [Set, Map] };
export const exact = Exact.groupBy([3, 4], x => x);
const { [key]: [, ExactComputed] } = { x: [Set, Array] };
export const exactComputed = ExactComputed.fromAsync([1]);
