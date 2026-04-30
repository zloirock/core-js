import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TS cast wraps the outer guard expression: `(Array.isArray(x) as any)`. peelNegation
// now uses `unwrapRuntimeExpr` which strips TS expression wrappers, so the inner
// CallExpression reaches the KNOWN_STATIC_TYPE_GUARDS dispatch
function take(input: unknown) {
  if ((Array.isArray(input) as any)) {
    return _atMaybeArray(input).call(input, 0);
  }
  return null;
}
export { take };