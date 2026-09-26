// A TS type-predicate can declare a leading `this` pseudo-parameter; the narrow must still bind the
// real argument by dropping that slot (else the type-level param index is off by one and the narrow
// is lost). With the narrow applied, the receiver resolves to number[] and the precise array helper
// is emitted instead of the generic instance helper.
function isArr(this: void, x: unknown): x is number[] { return Array.isArray(x); }
declare const v: unknown;
if (isArr(v)) { v.at(0); }
