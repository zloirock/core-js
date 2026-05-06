import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// AssignmentPattern default with conditional receiver `cond ? Array : Set`.
// Set has no `from` polyfill candidate; resolver still picks per-branch synth and emits
// only the viable branch
function f({
  from
} = cond ? {
  from: _Array$from
} : _Set) {
  return from([1]);
}
export { f };