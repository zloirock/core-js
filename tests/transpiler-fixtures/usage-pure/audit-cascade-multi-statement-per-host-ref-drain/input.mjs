// two AssignmentExpression cascades back-to-back, each with its own IIFE-bodied SE
// prefix containing an inner instance-method polyfill. each statement's cascade must
// absorb only ITS OWN inner refs into the lifted prefix - cross-statement bleed would
// emit one statement's `_ref` declaration into the other's range. uses `.at` in first
// cascade's IIFE and `.includes` in second so the two `_ref` declarations are visibly
// distinct in the output
let from;
let of;
({ Array: { from } } = ((function () { return [1].at(0); })(), globalThis));
({ Array: { of } } = ((function () { return [2].includes(1); })(), globalThis));
from([3]);
of(4);
