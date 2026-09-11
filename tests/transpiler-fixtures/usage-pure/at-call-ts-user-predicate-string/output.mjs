import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// user-defined type predicate `x is string` participates in narrowing on par with
// typeof/instanceof: the predicate's return-type annotation yields an equivalent
// typeof guard, so `x` narrows to `string` inside `if (isStr(x))`. expect `_atMaybeString`.
function isStr(x: unknown): x is string {
  return typeof x === 'string';
}
function f(x: unknown) {
  if (isStr(x)) return _atMaybeString(x).call(x, 0);
}