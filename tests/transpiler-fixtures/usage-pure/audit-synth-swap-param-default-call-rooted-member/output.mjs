import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a flat (non-fallback) param default that is a member chain rooted at a side-effecting IIFE
// (`(() => { globalThis.c++; return globalThis; })().Array`): the synth literal discards the chain,
// so the IIFE setup must be rescued ahead of the literal (run once) instead of dropped, and the
// IIFE body's `globalThis` substituted - earlier the whole call was lost (and the text emitter crashed)
function h({
  from
} = ((() => {
  _globalThis.c++;
  return _globalThis;
})().Array, {
  from: _Array$from
})) {
  return from([1]);
}
h();