import _AsyncIterator$from from "@core-js/pure/full/async-iterator/from";
// Same shape as `audit-iife-arg-with-existing-default` but caller-arg is `AsyncIterator`
// (Stage 3 proposal). In `mode: full` the proposal is included, so caller-arg resolution
// finds `AsyncIterator.from` and synth-swap targets the IIFE arg, replacing it with
// `{ from: _AsyncIterator$from }`. wrapper-default `= Array` is dead code at runtime
// (caller wins) - preserved as user syntax but never reached
const r = (({
  from = []
} = Array) => from([1, 2, 3]))({
  from: _AsyncIterator$from
});
export { r };