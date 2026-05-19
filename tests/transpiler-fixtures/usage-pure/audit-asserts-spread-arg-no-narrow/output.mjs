import _at from "@core-js/pure/actual/instance/at";
// SpreadElement in call args breaks positional param-to-arg mapping (spread length is
// unknown at compile time). `assertStr(opts, x): asserts x is string` paired with
// `assertStr(...rest, val)` could fill `x` from the spread, leaving `val` as an excess
// arg that doesn't bind to the predicate's parameterName. positional fallback would
// silently narrow the wrong binding. matchPredicateArg must bail on SpreadElement so
// the polyfill emitter falls back to the unknown-receiver branch
function assertString(opts: unknown, x: unknown): asserts x is string {}
function probe(val: unknown, rest: any[]) {
  assertString(...rest, val);
  return _at(val).call(val, 0);
}