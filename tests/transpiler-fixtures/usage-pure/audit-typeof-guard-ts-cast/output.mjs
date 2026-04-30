import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// guard expression wrapped in a TS cast: `(Array.isArray(input) as any)`. the cast
// has no runtime effect, so the inner `Array.isArray` call should still narrow `input`
// to an array branch and `.at(0)` resolves to the array-specific polyfill
function take(input: unknown) {
  if (Array.isArray(input) as any) {
    return _atMaybeArray(input).call(input, 0);
  }
  return null;
}
export { take };