import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-string-key on a known-static-guard callee: `Array['isArray'](x)` should
// dispatch the same as `Array.isArray(x)`. getMemberProperty now normalizes
// computed StringLiteral / ESTree Literal-with-string-value to the property name
function take(input: unknown) {
  if (Array['isArray'](input)) {
    return _atMaybeArray(input).call(input, 0);
  }
  return null;
}
export { take };