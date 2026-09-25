import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
// a spread contributes an unknown NUMBER of items, so the slot a later index pairs with is not
// the literal sitting there: the enumerated candidates are an incomplete over-approximation and
// a precision-needing consumer must not read a lone candidate as certain: the static read takes
// the runtime identity guard against it. that holds just as well when the shifted array sits
// under an object key, or nested deeper
const tail = [];
const {
  x: [, Shifted]
} = {
  x: [...tail, Object]
};
export const shifted = (Shifted === Object ? _Object$groupBy : Shifted.groupBy.bind(Shifted))([1, 2], x => x);
const {
  x: {
    y: [, Deep]
  }
} = {
  x: {
    y: [...tail, _Promise]
  }
};
export const deep = (Deep === _Promise ? _Promise$try : Deep.try.bind(Deep))(() => 1);
// a COMPUTED key must be read through the same canon the value pairing uses, or the shift goes
// unnoticed on exactly the slot that did pair a value
const key = "x";
const {
  [key]: [, Computed]
} = {
  x: [...tail, Array]
};
export const computed = (Computed === Array ? _Array$fromAsync : Computed.fromAsync.bind(Computed))([2]);
// WITHOUT a spread every index pairs exactly and the nested slot keeps its narrow, computed or not
const {
  x: [, Exact]
} = {
  x: [_Set, _Map]
};
export const exact = _Map$groupBy([3, 4], x => x);
const {
  [key]: [, ExactComputed]
} = {
  x: [_Set, Array]
};
export const exactComputed = _Array$fromAsync([1]);