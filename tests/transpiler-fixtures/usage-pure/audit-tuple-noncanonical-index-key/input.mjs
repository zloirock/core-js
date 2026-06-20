// a non-canonical string index does NOT name a tuple element: `Number("")` is 0 but `t[""]` is
// not `t[0]`, so the receiver type is unknown and .at falls to the generic dispatcher instead of
// the array-specific helper. a canonical `t["0"]` would still narrow to the element type
declare const t: [string[], number];
t[""].at(0);
