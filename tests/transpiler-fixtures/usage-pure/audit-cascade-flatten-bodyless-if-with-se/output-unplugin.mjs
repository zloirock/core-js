import _Array$from from "@core-js/pure/actual/array/from";
// bodyless cascade-flatten with SE on the receiver chain. before the wrap fix, both
// `logCall()` SE prefix AND `from = _Array$from` polyfill assignment got dropped when
// `exprStmt.remove()` targeted the synthetic block via the stale slot key. with the
// wrap, SE prefix lifts into the block AND polyfill assignment lands as a body sibling.
let from;
if (cond) { logCall();
from = _Array$from; }
console.log(from);
