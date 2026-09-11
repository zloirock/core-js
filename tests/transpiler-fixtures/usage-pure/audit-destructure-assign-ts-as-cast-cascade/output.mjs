import _Array$from from "@core-js/pure/actual/array/from";
// TSAsExpression-wrapped destructure-assignment cascade lock (companion to SE-tail
// case): `({Array:{from}} = globalThis) as any` is TS code where the user casts the
// assignment expression's value. the cast is compile-time only - runtime semantics
// match the bare assignment. the shared peeler walks through TSAsExpression so the
// cascade fires and `from` is rewritten to the polyfill assignment
let from;
from = _Array$from;
const arr = from([1, 2, 3]);
export { arr };