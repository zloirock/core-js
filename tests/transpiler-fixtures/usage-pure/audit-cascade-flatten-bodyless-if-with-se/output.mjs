import _Array$from from "@core-js/pure/actual/array/from";
// bodyless cascade-flatten with a side effect on the receiver chain. before the wrap fix, both
// the `logCall()` side-effect prefix AND the `from = _Array$from` polyfill assignment got dropped
// when removing the original statement targeted the synthetic block via the stale slot key. with
// the wrap, the side-effect prefix lifts into the block AND the polyfill assignment lands as a sibling
let from;
if (cond) {
  logCall();
  from = _Array$from;
}
console.log(from);