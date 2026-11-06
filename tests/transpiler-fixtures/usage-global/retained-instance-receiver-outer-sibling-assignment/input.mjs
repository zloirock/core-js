// A nested instance assignment retains the receiver between its outer siblings.
// The nested dispatch precedes the following sibling's native read.
const host = { m: [1, [2]], x: 1 };
let at, x;
({ m: { at }, x } = host);
console.log(at, x);
