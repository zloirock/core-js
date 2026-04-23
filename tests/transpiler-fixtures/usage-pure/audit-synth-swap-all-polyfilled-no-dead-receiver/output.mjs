import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// synth-swap where every destructured key has a polyfill: the emitted object literal reads
// only polyfill ids, the receiver `Promise` identifier is not referenced. the receiver pure
// import must NOT be injected - otherwise an unused `_Promise` leaks into the bundle.
// two shapes exercise the same applySynthSwaps path (IIFE arg + param default)
(({
  resolve
}) => resolve)({
  resolve: _Promise$resolve
});
function fn({
  resolve,
  reject
} = {
  resolve: _Promise$resolve,
  reject: _Promise$reject
}) {
  return [resolve, reject];
}