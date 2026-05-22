import _Array$from from "@core-js/pure/actual/array/from";
// Partial-consume destructure `const { Array: { from }, other } = (log(), wrapper)`:
// `Array.from` is extracted as a polyfill, `other` remains in the destructure, and the
// side-effecting `log()` runs exactly once as a lifted statement (no double invocation).
const wrapper = {
  Array,
  other: 1
};
log();
const from = _Array$from;
const {
  other
} = wrapper;