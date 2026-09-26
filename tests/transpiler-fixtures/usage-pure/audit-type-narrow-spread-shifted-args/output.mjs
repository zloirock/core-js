import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// a SPREAD argument contributes an unknown number of values, so every later param/arg pairing
// is shifted by an amount inference cannot know: binding a type parameter from the shifted
// position keys the narrow to a type the value may never have
function pick<T>(first: unknown, second: T): T {
  return second;
}
declare const words: string[];
declare const nums: number[];
export const shifted = _at(_ref = pick(...words, nums)).call(_ref, 0);
// a tuple spread shifts by a known amount, but the pairing still leaves the phase's positional
// assumption behind - it degrades the same way
function triple<T>(a: number, b: T, c: string): T {
  return b;
}
declare const pre: [number, number[]];
export const tupleShifted = _at(_ref2 = triple(...pre, "s")).call(_ref2, 0);
// WITHOUT a spread the pairing is exact and the narrow stands
export const exact = _atMaybeArray(_ref3 = pick(1, nums)).call(_ref3, 0);