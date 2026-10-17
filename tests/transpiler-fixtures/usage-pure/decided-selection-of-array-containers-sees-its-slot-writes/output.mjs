import _Iterator from "@core-js/pure/actual/iterator";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
// a binding holding a selection of array literals the build decides holds whichever arm ran, so a write of
// a slot through it reaches the slot a later read takes, as it does for a selection of object literals:
// the read takes the written value, never the static of the arm the selection yields. with no write the
// decided arm's slot is read as its static
const ternary = [Array];
ternary[0] = _Iterator;
export const iterated = ternary[0].from([1]);
const fallback = [_Set];
fallback[0] = _Promise;
export const attempted = fallback[0].try(() => 1);
const untouched = [Number];
export const integral = _Number$isInteger(1);