// bodyless cascade-flatten with a side effect on the receiver chain. before the wrap fix, both
// the `logCall()` side-effect prefix AND the `from = _Array$from` polyfill assignment got dropped
// when removing the original statement targeted the synthetic block via the stale slot key. with
// the wrap, the side-effect prefix lifts into the block AND the polyfill assignment lands as a sibling
let from;
if (cond) ({ Array: { from } } = (logCall(), globalThis));
console.log(from);
