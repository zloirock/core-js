import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a `||` fallback param default whose resolved LEFT is a member chain rooted at a side-effecting IIFE
// (`(() => { globalThis.c++; return globalThis; })().Array || Set`): the fallback collapses to the
// polyfilled literal, but the left's chain-root call setup must be rescued ahead of it (run once) -
// the structural prefix harvest alone stops at the chain root, dropping the call
function g({
  from
} = ((() => {
  _globalThis.c++;
  return _globalThis;
})(), {
  from: _Array$from
})) {
  return from([1]);
}
g();