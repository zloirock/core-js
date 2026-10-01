// Negative case: `let A = Array; A = other; new A(...)` reassigns the alias to an
// unknown identifier, so the constructed value's type is unclassified and `arr.at(0)`
// emits the generic instance polyfill (not the array-specific one).
let A = Array;
A = other;
const arr = new A(1, 2, 3);
arr.at(0);
