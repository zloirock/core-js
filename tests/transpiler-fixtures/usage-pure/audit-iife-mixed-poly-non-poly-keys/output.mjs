import _Array$from from "@core-js/pure/actual/array/from";
// IIFE param destructure with one polyfillable static method `from` and one user-defined
// member `myExtension`. synth-swap rewrites the call argument so the polyfill maps onto a
// fresh object literal: `from` resolves to the polyfill binding, `myExtension` falls back
// to a member lookup on the original Array global. caller-side semantics for both keys
// stay aligned with the destructure target
const r = (({
  from,
  myExtension
}) => [from, myExtension])({
  from: _Array$from,
  myExtension: Array.myExtension
});
export { r };