// A `var` object-destructure that is the unbraced body of a for-in substitutes the static method,
// matching the braced-body form
for (const k in obj) var { from } = Array;
from([1]);
