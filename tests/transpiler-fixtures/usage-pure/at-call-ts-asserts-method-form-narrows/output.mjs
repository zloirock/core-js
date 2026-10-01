import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// method-form user predicate: `obj.method(x)` where the method's return type is `x is T`.
// a MemberExpression callee (not just a bare identifier) must be resolved to obj's
// annotation, the method member found, and its return type inspected for TSTypePredicate.
interface Util {
  isStr(x: unknown): x is string;
}
declare const u: Util;
function probe(x: unknown) {
  if (u.isStr(x)) {
    return _atMaybeString(x).call(x, 0);
  }
}