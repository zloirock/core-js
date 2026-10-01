// A `var` object-destructure that is the unbraced body of a for-OF substitutes the static method,
// the for-of twin of the for-in body case
for (const x of arr) var { from } = Array;
from([1]);
