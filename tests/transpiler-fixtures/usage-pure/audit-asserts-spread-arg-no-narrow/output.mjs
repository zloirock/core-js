import _at from "@core-js/pure/actual/instance/at";
// SpreadElement in call args breaks positional param-to-arg mapping (spread length is
// unknown at compile time). `assertStr(opts, x): asserts x is string` called as
// `assertStr(...rest, val)` could fill `x` from the spread, leaving `val` as an excess arg
// that maps to the wrong predicate parameter. matching the predicate arg must bail on a
// SpreadElement so emit falls back to the unknown-receiver branch, not a wrong narrow
function assertString(opts: unknown, x: unknown): asserts x is string {}
function probe(val: unknown, rest: any[]) {
  assertString(...rest, val);
  return _at(val).call(val, 0);
}