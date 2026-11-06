// the destructured rhs is a const-IDENTIFIER bound to an array literal, not the literal itself
// (`const arr = [Map]; const [A] = arr`). the receiver resolver follows the const binding to the
// underlying array so the element alias still resolves - in declarations AND in reassignments
const arr = [Map];
const [A] = arr;
A.groupBy([], (x) => x);

const brr = [Object];
let B;
[B] = brr;
B.fromEntries([["k", 1]]);
