import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// method-form predicate with `asserts` flag: `obj.assertX(x)` as a statement narrows `x`
// from that point forward. parallel to the `is T` form but via the `asserts` predicate
// shape; both forms route through the same MemberExpression callee branch.
interface Validator {
  assertString(v: unknown): asserts v is string;
}
declare const u: Validator;
function probe(x: unknown) {
  u.assertString(x);
  return _atMaybeString(x).call(x, 0);
}