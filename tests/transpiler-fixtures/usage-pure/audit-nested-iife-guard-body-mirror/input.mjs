// a transparent IIFE wrapping a guard stays CALLED - the body effects and the selection run
// natively - and only the value leaves inside its return expression are mirrored; the guard's
// falsy path keeps its native TypeError
let m = 1;
const { Array: { from } } = (() => m && globalThis)();
from([1]);
