import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// nested method-form `asserts x is T` predicate: narrows after the call returns normally
// (not just inside an `if`-truthy branch). resolvePredicateGuard threads the asserts flag
// through resolveMemberCallChain identically to the `x is T` form
declare const obj: {
  util: {
    assertStr(x: unknown): asserts x is string;
  };
};
function take(input: unknown) {
  obj.util.assertStr(input);
  return _atMaybeString(input).call(input, 0);
}