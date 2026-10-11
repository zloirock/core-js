// a binding holding a selection of array literals the build decides holds whichever arm ran, so a write of
// a slot through it reaches the slot a later read takes, as it does for a selection of object literals:
// the read takes the written value, never the static of the arm the selection yields. with no write the
// decided arm's slot is read as its static
const ternary = typeof Symbol != 'undefined' ? [Array] : [Set];
ternary[0] = Iterator;
export const iterated = ternary[0].from([1]);
const fallback = [Set] || [Map];
fallback[0] = Promise;
export const attempted = fallback[0].try(() => 1);
const untouched = typeof Symbol != 'undefined' ? [Number] : [Set];
export const integral = untouched[0].isInteger(1);
