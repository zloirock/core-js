// method-form user predicate: `obj.method(x)` where the method's return type is
// `x is T`. previously `resolvePredicateGuard` only handled bare-identifier callees
// and bailed on MemberExpression. the fix resolves obj's annotation, finds the method
// member, inspects its return type for TSTypePredicate
interface Util {
  isStr(x: unknown): x is string;
}
declare const u: Util;
function probe(x: unknown) {
  if (u.isStr(x)) {
    return x.at(0);
  }
}
