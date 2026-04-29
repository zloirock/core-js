import _Array$from from "@core-js/pure/actual/array/from";
// single-chain nested destructure with `let` kind - flatten preserves the declaration
// kind so reassignment semantics (block-scope) carry over to the emitted local binding
let from = _Array$from;
from([1, 2, 3]);