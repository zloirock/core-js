import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// negated optional: `if (!Array.isArray?.(x)) return; x.at(0)`. peelNegation now uses
// unwrapRuntimeExpr so ChainExpression wrap (ESTree) + UnaryExpression(!) outer + the
// inner OptionalCallExpression all reach the KNOWN_STATIC_TYPE_GUARDS dispatch
function take(input: unknown) {
  if (!Array.isArray?.(input)) return null;
  return _atMaybeArray(input).call(input, 0);
}
export { take };