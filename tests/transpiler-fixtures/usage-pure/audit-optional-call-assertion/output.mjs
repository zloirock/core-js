import _at from "@core-js/pure/actual/instance/at";
// optional-call assertion `obj.assertStr?.(input)` does NOT narrow `input` in TS: when `obj`
// is null/undefined the call is skipped and the assertion never runs. the assertion guard must
// bail on any optional chain in the call (ChainExpression / OptionalCallExpression /
// OptionalMemberExpression), so the post `.at(0)` falls back to the generic `_at`, not a string narrow.
declare const obj: {
  assertStr?(x: unknown): asserts x is string;
};
function take(input: unknown) {
  obj.assertStr?.(input);
  return _at(input).call(input, 0);
}