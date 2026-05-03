// receiver-side optional `obj?.assertStr(x)` is also a skip-able assertion: when obj is
// nullish, the member access short-circuits and the call never runs. babel encodes this
// as `OptionalMemberExpression` for `obj?.assertStr` wrapped in a CallExpression; oxc
// puts the CallExpression in a ChainExpression. either shape must be detected by the
// optional-chain bail in parseAssertionStatementGuard. lock against regression where
// callee chain walking is expanded to deeper namespacing
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;

function take(input: unknown) {
  obj?.assertStr(input);
  return input.at(0);
}
