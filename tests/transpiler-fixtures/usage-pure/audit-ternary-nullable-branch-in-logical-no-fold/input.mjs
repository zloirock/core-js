// the nullable-branch ternary fold drops a statically null arm, which is sound for the
// bare RECEIVER (a nullish receiver throws the same TypeError transformed or not) but not
// for an enclosing logical: `(c ? nums : null)` may still be null at runtime, so `??` must
// not fold to the Array survivor (generic dispatch). the bare ternary receiver keeps the
// Array narrow
declare const c: boolean;
declare const nums: number[];
((c ? nums : null) ?? 'x').at(0);
(c ? nums : null).includes(1);
