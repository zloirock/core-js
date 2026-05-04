// edge: SequenceExpression-extracted optional callee `(0, obj?.assert)(x)`. the SE wrapper
// strips method-context but the optional segment inside still means the call may be skipped
// when obj is nullish. hasOptionalChainInCall walks CallExpression -> SequenceExpression
// (no recognized branch -> bail). lock current behavior: assertion currently DOES narrow
// here because the SE-extracted callee is unwrapped only after the optional check, exposing
// a soundness gap when the SE wraps an OptionalMember
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;
function take(input: unknown) {
  (0, obj?.assertStr)(input);
  input.at(0);
  return input.padStart(2);
}
