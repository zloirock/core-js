import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a write through a wrapped target - a type assertion, a non-null assertion, parens the parser keeps -
// is a write of the binding like any other, so an earlier plain write is no longer its sole value: a
// later read sees the wrapped write's value
let A: any;
A = _Map;
(A as any) = Object;
export const grouped = () => _Object$groupBy(items, key);
let B: any;
B = _Promise;
B! = _Iterator;
export const iterated = _Iterator$from(source);
let D: any;
D = _Iterator;
(D) = Array;
export const listed = _Array$of(1);