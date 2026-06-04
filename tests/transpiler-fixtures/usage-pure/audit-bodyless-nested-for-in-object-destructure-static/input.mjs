// A `var` object-destructure that is the unbraced body of a NESTED for-in (the inner loop is itself
// the outer loop's unbraced body) still substitutes the static method
for (const a in o1) for (const b in o2) var { from } = Array;
from([1]);
