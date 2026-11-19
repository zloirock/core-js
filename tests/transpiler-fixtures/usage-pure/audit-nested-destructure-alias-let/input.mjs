// single-chain nested destructure with `let` kind - flatten preserves the declaration
// kind so reassignment semantics (block-scope) carry over to the emitted local binding
let { Array: { from } } = globalThis;
from([1, 2, 3]);
