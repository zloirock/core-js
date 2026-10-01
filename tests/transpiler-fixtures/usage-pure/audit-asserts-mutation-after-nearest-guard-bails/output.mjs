import _at from "@core-js/pure/actual/instance/at";
// Negative control: an `asserts x is string` predicate followed by a reassignment
// of `x` before use must drop the narrowing. `x.at(0)` after the reassignment is
// called on `unknown`, so emission falls back to the generic Array#at polyfill
// rather than the string-specific path. Confirms a stale assert-narrow is not
// kept across an intervening mutation.
function assertString(x: unknown): asserts x is string {}
declare function readAnything(): unknown;
function probe(x: unknown) {
  assertString(x);
  x = readAnything();
  return _at(x).call(x, 0);
}