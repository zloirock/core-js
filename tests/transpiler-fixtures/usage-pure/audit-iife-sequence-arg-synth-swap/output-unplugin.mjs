import _Array$from from "@core-js/pure/actual/array/from";
// IIFE with a SequenceExpression arg `(0, Array)` - evaluates to `Array` at runtime.
// receiver resolution walks past the comma-expression tail to find `Array` and rewrites
// the destructure with the polyfill substitution, preserving the preceding side-effect
// (the `0` here is a no-op placeholder, but a real SE head would carry its work untouched)
const result = (({ from = _Array$from }) => from([1, 2, 3]))((0, Array));
export { result };