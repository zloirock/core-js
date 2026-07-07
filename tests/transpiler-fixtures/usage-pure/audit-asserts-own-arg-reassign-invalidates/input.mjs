// a reassignment buried in the assertion guard's OWN call-argument slot makes the narrow stale
// (the SE-tail unwrap still binds the var, but the runtime value is the post-mutation one) - the
// guard's own slot invalidates exactly like a mutated if-test, so the read below dispatches the
// GENERIC Maybe. a non-mutating SE in the same slot keeps the narrow; the if-test twin stays
// covered. multi-type methods only (at / includes) - a string-only method's Maybe-String IS its
// generic form and cannot discriminate a stale narrow
function assertString(v: unknown): asserts v is string {}
export function ownArgReassign(x: unknown) {
  assertString((x = 5, x));
  return (x as any).at(0);
}
function ping() {}
export function nonMutatingSeInArg(x: unknown) {
  assertString((ping(), x));
  return (x as any).includes('a');
}
export function ifTestSlotTwin(x: unknown) {
  if (typeof (x = 5, x) !== 'string') return null;
  return (x as any).at(1);
}

// nearest-guard-wins boundary: a CLEAN re-assert after the stale one restores the narrow -
// the assertion contract (a returning asserts-function guarantees its predicate) makes the
// nearest guard authoritative, exactly as TypeScript re-narrows after the second call
export function reAssertRestoresNarrow(x: unknown) {
  assertString((x = 5, x));
  assertString(x);
  return (x as any).at(2);
}
