import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
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
  _at(input).call(input, 0);
  return _padStartMaybeString(input).call(input, 2);
}