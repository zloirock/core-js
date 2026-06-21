import _at from "@core-js/pure/actual/instance/at";
// receiver-side optional `obj?.assertStr(x)` is also a skip-able assertion: when obj is
// nullish the member access short-circuits and the call never runs. babel encodes this as
// an OptionalMemberExpression wrapped in a CallExpression; oxc puts the CallExpression in a
// ChainExpression. either shape must trip the optional-chain bail so the assertion narrow is
// suppressed; lock against regression as callee-chain walking grows deeper
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;
function take(input: unknown) {
  obj?.assertStr(input);
  return _at(input).call(input, 0);
}