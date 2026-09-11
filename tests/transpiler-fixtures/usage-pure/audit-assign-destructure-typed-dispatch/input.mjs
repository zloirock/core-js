// the `let x; ({ x } = Source)` destructure's own write is the aliasing event, not a
// disqualifying reassignment: the body-extract alias must register so receiver narrowing
// through the binding dispatches the TYPED instance variant (the registrar once counted
// the destructure's own assignment as a violation and fell back to the generic helper).
// a REAL later reassignment still disqualifies - the value may no longer be the static.
// the exclusion is by source-range containment of the destructure pattern, so it also holds
// for a NESTED assignment pattern where the bound name sits deeper inside the same pattern
let from;
({ from } = Array);
export const r1 = from([1, 2]).at(0);
let keys, rest;
({ keys, ...rest } = Object);
export const r2 = keys({ a: 1 }).at(0);
let of2;
({ of: of2 } = Array);
of2 = somethingElse;
export const r3 = of2(3).at(0);
let from3;
({ a: { from: from3 } } = { a: Array });
export const r4 = from3([1]).includes(2);
