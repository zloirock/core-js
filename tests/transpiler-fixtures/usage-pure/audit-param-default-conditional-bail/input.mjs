// AssignmentPattern default with conditional receiver `cond ? Array : Set`.
// Set has no `from` polyfill candidate; resolver still picks per-branch synth and emits
// only the viable branch
function f({ from } = cond ? Array : Set) {
  return from([1]);
}
export { f };
