// arms of an undecided test that write one key, or a ternary whose arms spell it, hold that key whichever
// ran - read from a closure too. a closure a later write may reach once called again, and arms naming
// different keys, keep the native read. A substituted inline key still evaluates its test.
let closureKey;
if (flag) closureKey = 'at';
else closureKey = 'at';
export const viaClosure = list => list[closureKey](0);
const ternaryKey = flag ? 'findLast' : 'findLast';
export const viaTernary = list => list[ternaryKey](x => x);
export const inPlace = list => list[flag ? 'toSorted' : 'toSorted']();
let laterKey;
if (flag) laterKey = 'flat';
else laterKey = 'flat';
export const beforeLaterWrite = list => list[laterKey]();
export function reset() {
  laterKey = 'flatMap';
}
const otherKey = flag ? 'with' : 'toReversed';
export const viaDisagreeing = list => list[otherKey](0, 1);
