// A single-element array-wrapper on a destructuring-assignment RHS (`[{ from }] = [Array]`) resolves
// through the wrapper to the static method, matching the declaration-form flatten
let from;
[{ from }] = [Array];
from([1]);
