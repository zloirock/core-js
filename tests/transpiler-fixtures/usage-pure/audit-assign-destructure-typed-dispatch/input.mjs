// the `let x; ({ x } = Source)` destructure's own write is the aliasing event, not a
// disqualifying reassignment: the body-extract alias must register so receiver narrowing
// through the binding dispatches the TYPED instance variant (the registrar once counted
// the destructure's own assignment as a violation and fell back to the generic helper).
// a REAL later reassignment still disqualifies - the value may no longer be the static
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
