// computed-string-key on a known-static-guard callee: `Array['isArray'](x)` should
// dispatch the same as `Array.isArray(x)`. getMemberProperty now normalizes
// computed StringLiteral / ESTree Literal-with-string-value to the property name
function take(input: unknown) {
  if (Array['isArray'](input)) {
    return input.at(0);
  }
  return null;
}
export { take };
