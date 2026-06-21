// two AssignmentExpression cascades back-to-back, each with its own IIFE-bodied side-effect
// prefix containing an inner instance-method polyfill. each cascade must absorb only ITS OWN
// inner refs into the lifted prefix; cross-statement bleed would emit one statement's `_ref`
// into the other's range. `.at` in the first IIFE and `.includes` in the second keep them distinct
let from;
let of;
({ Array: { from } } = ((function () { return [1].at(0); })(), globalThis));
({ Array: { of } } = ((function () { return [2].includes(1); })(), globalThis));
from([3]);
of(4);
