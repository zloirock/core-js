import _AsyncIterator$from from "@core-js/pure/full/async-iterator/from";
// IIFE caller arg `AsyncIterator` (Stage 3) wins over the wrapper-default `= Array`. in
// `mode: full` the proposal is in-scope so `AsyncIterator.from` resolves and the call-site
// arg becomes `{ from: _AsyncIterator$from }`. wrapper-default is preserved verbatim but
// never reached at runtime
const r = (({
  from = []
} = Array) => from([1, 2, 3]))({
  from: _AsyncIterator$from
});
export { r };