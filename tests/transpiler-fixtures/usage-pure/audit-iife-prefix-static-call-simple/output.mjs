import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// simple IIFE-prefix-SE returning `Promise`, then `.resolve(1)` on it. Control case
// against the chain-assign double-eval bug: here `calls++` must run exactly once and
// the static call is subsumed by the polyfill.
let calls = 0;
const r = ((() => {
  calls++;
  return _Promise;
})(), _Promise$resolve)(1);
[r, calls];