// a for-head `let`/`const` binding shadows the outer constructor alias for the whole loop, so a
// reassignment inside the loop body retargets the inner binding, never the outer one. the outer
// alias stays pinned to the constructor and the static read must still substitute the receiver-less
// helper. the reassignment walk used to descend into the loop and treat the inner write as a clobber.
const A = Array;
for (let A of []) { A = 0; }
A.from([1]);
// a bare-identifier for-head assigns the EXISTING outer binding (a `var` head hoists to it too),
// so it genuinely reassigns the alias - NOT a shadow. the alias is no longer provably the
// constructor and the static read must stay native (no substitution).
let B = Array;
for (B of [Array]) {}
B.of(1, 2);
