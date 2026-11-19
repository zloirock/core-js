// Shared constructor arms preserve each source test and the static claim.
const C0 = Array;
const C1 = Array;
const C2 = first() ? C1 : C0;
const C3 = second() ? C2 : C1;
C3.from([3]);
