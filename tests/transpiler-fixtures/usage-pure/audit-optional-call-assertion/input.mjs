// optional-call assertion `obj.assertStr?.(input)`: babel emits `OptionalCallExpression`,
// oxc/TS-ESTree wraps a `CallExpression{optional:true}` in `ChainExpression`.
// parseAssertionStatementGuard peels the wrapper via unwrapRuntimeExpr and accepts both
// shapes, so the asserts-predicate narrows `input` to string after the optional call
declare const obj: {
  assertStr?(x: unknown): asserts x is string;
};

function take(input: unknown) {
  obj.assertStr?.(input);
  return input.at(0);
}
