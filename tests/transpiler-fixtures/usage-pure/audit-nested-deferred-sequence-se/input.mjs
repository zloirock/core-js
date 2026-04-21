// `inner()` is a side effect that must survive the destructuring extraction.
// `of` is an Array.of polyfill, so the full pattern is empty after extraction.
// The SE should land as a standalone ExpressionStatement before the `const of = ...`.
function wrap() {
  const { of } = (inner(), Array);
  return of(1, 2);
}
