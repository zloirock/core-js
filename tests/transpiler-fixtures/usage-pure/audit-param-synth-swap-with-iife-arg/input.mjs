// function param destructure with default `= Array`: `function f({ from } = Array)`.
// synth-swap should replace the default with a literal stub holding the dispatched
// `from`, and the call `f()` must still resolve to the polyfilled `Array.from`
function f({ from } = Array) {
  return from([1]);
}
const result = f();
export { result };
