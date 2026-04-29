import _Array$of from "@core-js/pure/actual/array/of";
// `inner()` is a side effect that must survive the destructuring extraction.
// `of` is an Array.of polyfill, so the full pattern is empty after extraction.
// The side effect should land as a standalone bare expression statement before the
// `const of = ...`.
function wrap() {
  inner();
  const of = _Array$of;
  return of(1, 2);
}