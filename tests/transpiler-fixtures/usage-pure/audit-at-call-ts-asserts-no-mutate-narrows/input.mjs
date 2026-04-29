// positive control for the mutation-after-guard symmetry: assertion guard with NO
// reassignment between the assertion and the use. narrowing must survive - the resolver
// keeps the string type, polyfill picks the precise `_atMaybeString` import. counterpart
// to `audit-at-call-ts-asserts-mutate-invalidates` which exercises the invalidation path
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x);
  return x.at(0);
}
