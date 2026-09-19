import _at from "@core-js/pure/actual/instance/at";
// A spread element at or before an array-pattern slot shifts the runtime position, so the paired
// RHS element is not the value that lands in the slot - the binding must widen to the generic helper
// (`_at`) instead of the array-specific `_atMaybeArray`, which would throw on a foreign runtime value
// supplied by the spread (ie:11).
declare const a: any[];
let b;
[, b] = [...a, [1, 2, 3]];
_at(b).call(b, 0);