import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a reassignment buried in the assertion guard's OWN call-argument slot makes the narrow stale
// (the SE-tail unwrap still binds the var, but the runtime value is the post-mutation one) - the
// guard's own slot invalidates exactly like a mutated if-test, so the read below dispatches the
// GENERIC Maybe. a non-mutating SE in the same slot keeps the narrow; the if-test twin stays
// covered. multi-type methods only (at / includes) - a string-only method's Maybe-String IS its
// generic form and cannot discriminate a stale narrow
function assertString(v: unknown): asserts v is string {}
export function ownArgReassign(x: unknown) {
  var _ref;
  assertString((x = 5, x));
  return _at(_ref = x as any).call(_ref, 0);
}
function ping() {}
export function nonMutatingSeInArg(x: unknown) {
  var _ref2;
  assertString((ping(), x));
  return _includesMaybeString(_ref2 = x as any).call(_ref2, 'a');
}
export function ifTestSlotTwin(x: unknown) {
  var _ref3;
  if (typeof (x = 5, x) !== 'string') return null;
  return _at(_ref3 = x as any).call(_ref3, 1);
}

// nearest-guard-wins boundary: a CLEAN re-assert after the stale one restores the narrow -
// the assertion contract (a returning asserts-function guarantees its predicate) makes the
// nearest guard authoritative, exactly as TypeScript re-narrows after the second call
export function reAssertRestoresNarrow(x: unknown) {
  var _ref4;
  assertString((x = 5, x));
  assertString(x);
  return _atMaybeString(_ref4 = x as any).call(_ref4, 2);
}