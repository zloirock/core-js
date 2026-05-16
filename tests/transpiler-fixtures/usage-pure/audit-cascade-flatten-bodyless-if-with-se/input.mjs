// bodyless cascade-flatten with SE on the receiver chain. before the wrap fix, both
// `logCall()` SE prefix AND `from = _Array$from` polyfill assignment got dropped when
// `exprStmt.remove()` targeted the synthetic block via the stale slot key. with the
// wrap, SE prefix lifts into the block AND polyfill assignment lands as a body sibling.
let from;
if (cond) ({ Array: { from } } = (logCall(), globalThis));
console.log(from);
