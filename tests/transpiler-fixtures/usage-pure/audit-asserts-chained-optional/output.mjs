import _at from "@core-js/pure/actual/instance/at";
// chained-optional assertion `obj?.api?.assertStr(x)`: any nullish hop in the chain
// short-circuits and skips the assertion. walk-up in `hasOptionalChainInCall` must catch
// the deeper OptionalMemberExpression / MemberExpression(optional) hops, not just the
// outermost one. lock against the historical bug where only the immediate parent was
// inspected and inner `?.` segments leaked through to grant unsound narrowing
declare const obj: {
  api?: {
    assertStr(x: unknown): asserts x is string;
  };
} | undefined;
function take(input: unknown) {
  obj?.api?.assertStr(input);
  return _at(input).call(input, 0);
}