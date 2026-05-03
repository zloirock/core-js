import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// re-assertion after mutation: TS-flow re-narrows x to string at the second assertString
// call. hasMutationAfterGuards now checks ONLY the nearest guard's mutation window
// (`(nearestGuardIdx, current.key]`); older guards are subsumed - their invalidation by
// mutations BEFORE the nearest guard is irrelevant. closer guard re-narrows independently
function assertString(x: unknown): asserts x is string {}
declare function readAnything(): unknown;
function probe(x: unknown) {
  assertString(x);
  x = readAnything();
  assertString(x);
  return _atMaybeString(x).call(x, 0);
}