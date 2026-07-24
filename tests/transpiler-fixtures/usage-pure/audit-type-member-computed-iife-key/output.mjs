import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3;
// A type-literal member accessed through a zero-arg IIFE computed key (`g[(() => 'rows')()]`) folds the
// IIFE to its returned key, so the receiver keeps the typed dispatch on that member: an Array member
// narrows to the array method, a String member to the string method (a single-type method would resolve
// regardless and prove nothing). distinct member/method per line.
interface Grid {
  rows: number[];
  cols: string;
  cells: number[][];
}
declare const g: Grid;
export const r1 = _atMaybeArray(_ref = g[(() => 'rows')()]).call(_ref, 0);
export const r2 = _atMaybeString(_ref2 = g[(() => 'cols')()]).call(_ref2, 0);
export const r3 = _flatMaybeArray(_ref3 = g[(() => 'cells')()]).call(_ref3);