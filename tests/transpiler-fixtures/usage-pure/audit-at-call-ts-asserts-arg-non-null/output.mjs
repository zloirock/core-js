import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `asserts x is string` invoked with a non-null assertion argument `assertString(x!)`.
// the TS wrapper has no runtime effect - the underlying binding `x` is passed, so
// narrowing must apply the same as for a bare Identifier argument
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  assertString(x!);
  return _atMaybeString(x).call(x, 0);
}