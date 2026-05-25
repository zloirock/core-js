// negated optional: `if (!Array.isArray?.(x)) return; x.at(0)`. negation peel now uses
// runtime-transparent peel so ChainExpression wrap (ESTree) + UnaryExpression(!) outer +
// the inner OptionalCallExpression all reach the KNOWN_STATIC_TYPE_GUARDS dispatch
function take(input: unknown) {
  if (!Array.isArray?.(input)) return null;
  return input.at(0);
}
export { take };
