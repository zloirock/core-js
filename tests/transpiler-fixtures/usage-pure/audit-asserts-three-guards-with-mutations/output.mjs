import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// three guards interspersed with mutations:
//   [0] assertString  [1] mutate  [2] assertString  [3] mutate  [4] assertString  [5] usage
// nearest guard is at slot 4, mutation window (4, 5] is clean, narrowing applies. older
// guards at [0] and [2] are subsumed - their invalidation by mutations [1] and [3] is
// irrelevant since [4] re-narrows. confirms the algorithm scales to N alternating guards
function assertString(x: unknown): asserts x is string {}
declare function readAnything(): unknown;
function probe(x: unknown) {
  assertString(x);
  x = readAnything();
  assertString(x);
  x = readAnything();
  assertString(x);
  return _atMaybeString(x).call(x, 0);
}