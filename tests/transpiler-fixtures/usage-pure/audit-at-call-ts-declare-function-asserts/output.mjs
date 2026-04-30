import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// ambient `declare function` assertion predicate. its binding doesn't appear in babel's
// scope.bindings (TS strips ambient declarations at runtime), so the predicate-guard
// resolver must fall back to walking ambient declarations to recover the narrowing.
// without that fallback x stays unknown after the assertion call and the polyfill
// dispatch widens to the generic instance form
declare function assertString(x: unknown): asserts x is string;
function probe(x: unknown) {
  assertString(x);
  return _atMaybeString(x).call(x, 0);
}