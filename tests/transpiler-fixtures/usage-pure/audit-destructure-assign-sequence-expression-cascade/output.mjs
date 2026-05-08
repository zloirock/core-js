import _Array$from from "@core-js/pure/actual/array/from";
// Minifier-shaped `(0, ({Array:{from}} = globalThis))` keeps the destructure-assignment as a SE tail.
// Flatten must peel the SE only at the tail position so `from` resolves while leading effects stay in order.
let from;
0;
from = _Array$from;
const arr = from([1, 2, 3]);
export { arr };