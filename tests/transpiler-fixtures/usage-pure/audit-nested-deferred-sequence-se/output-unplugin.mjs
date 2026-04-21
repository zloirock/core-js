import _Array$of from "@core-js/pure/actual/array/of";
// `inner()` is a side effect that must survive the destructuring extraction.
// `of` is an Array.of polyfill, so the full pattern is empty after extraction.
// The SE should land as a standalone ExpressionStatement before the `const of = ...`.
function wrap() {
  (inner(), Array);
const of = _Array$of;
  return of(1, 2);
}