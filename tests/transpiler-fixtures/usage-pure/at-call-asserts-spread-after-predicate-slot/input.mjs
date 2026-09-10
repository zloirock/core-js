// a spread AFTER the slot the predicate names leaves that slot where it stands, so the assertion
// still binds `val` and narrows it to string; a spread at or before the slot may have filled it and
// declines, as before
declare function assertStr(x: unknown, ...rest: unknown[]): asserts x is string;
declare function assertOpts(opts: unknown, x: unknown): asserts x is string;
export function after(val: unknown, rest: any[]) {
  assertStr(val, ...rest);
  return val.at(0);
}
export function before(val: unknown, rest: any[]) {
  assertOpts(...rest, val);
  return val.includes('a');
}
