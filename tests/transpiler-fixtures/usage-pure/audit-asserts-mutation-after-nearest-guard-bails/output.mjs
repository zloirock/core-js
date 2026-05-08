import _at from "@core-js/pure/actual/instance/at";
// negative control: mutation BETWEEN the nearest guard and usage correctly invalidates
// narrowing. `assertString(x); x = ...; x.at(0)` - nearest guard is at slot 0, mutation
// at slot 1 sits in the (0, 2] window. hasMutationAfterGuards returns true -> narrowing
// dropped -> generic `_at` emitted (not string-specific). confirms the nearest-guard fix
// is gated correctly: the simplification doesn't over-keep narrowing across mutations
function assertString(x: unknown): asserts x is string {}
declare function readAnything(): unknown;
function probe(x: unknown) {
  assertString(x);
  x = readAnything();
  return _at(x).call(x, 0);
}