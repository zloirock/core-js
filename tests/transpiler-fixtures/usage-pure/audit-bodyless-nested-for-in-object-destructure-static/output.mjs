import _Array$from from "@core-js/pure/actual/array/from";
// A `var` object-destructure that is the unbraced body of a NESTED for-in (the inner loop is itself
// the outer loop's unbraced body) still substitutes the static method
for (const a in o1) for (const b in o2) var from = _Array$from;
from([1]);