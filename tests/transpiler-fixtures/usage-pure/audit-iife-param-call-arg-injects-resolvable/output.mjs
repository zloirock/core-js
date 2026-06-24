import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An inline-resolvable CALL arg passed to an IIFE destructure-param whose default is a polyfill dead-end:
// `(() => (..., Array))()` statically resolves to `Array`, so - exactly like a bare-Identifier or a proxy-
// global member arg - it supersedes the dead `Object` default and the live receiver's `Array.from` is
// injected. the call's side effect is rescued AHEAD of the synth literal, so it still evaluates once.
const log = [];
const r = (({
  from
} = Object) => from([1]))(((() => (_pushMaybeArray(log).call(log, "e"), Array))(), {
  from: _Array$from
}));
export { r, log };