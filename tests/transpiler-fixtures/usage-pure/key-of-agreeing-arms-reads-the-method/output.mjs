import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
// arms of an undecided test that write one key, or a ternary whose arms spell it, hold that key whichever
// ran - read from a closure too. a closure a later write may reach once called again, and arms naming
// different keys, keep the native read
let closureKey;
if (flag) closureKey = 'at';else closureKey = 'at';
export const viaClosure = list => _at(list).call(list, 0);
const ternaryKey = flag ? 'findLast' : 'findLast';
export const viaTernary = list => _findLastMaybeArray(list).call(list, x => x);
export const inPlace = list => _toSortedMaybeArray(list).call(list);
let laterKey;
if (flag) laterKey = 'flat';else laterKey = 'flat';
export const beforeLaterWrite = list => list[laterKey]();
export function reset() {
  laterKey = 'flatMap';
}
const otherKey = flag ? 'with' : 'toReversed';
export const viaDisagreeing = list => list[otherKey](0, 1);