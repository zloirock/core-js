import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// edge: SequenceExpression-extracted optional callee `(0, obj?.assertStr)(x)`. the SE wrapper
// strips method-context and the optional segment means the call may be skipped when obj is
// nullish - so the assertion does NOT narrow `input` (narrowing through a maybe-skipped call
// would be unsound, and TS itself declines it). `.at` stays the generic `_at` (proving no
// narrow); `padStart` emits the string helper only because `padStart` is String-only
declare const obj: {
  assertStr(x: unknown): asserts x is string;
} | undefined;
function take(input: unknown) {
  (0, obj?.assertStr)(input);
  _at(input).call(input, 0);
  return _padStartMaybeString(input).call(input, 2);
}