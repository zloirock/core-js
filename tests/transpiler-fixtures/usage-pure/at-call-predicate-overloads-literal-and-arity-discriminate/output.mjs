import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TS resolves a predicate call to ONE overload: the literal argument refutes the `'string'` header
// and selects the `'array'` one, the second argument's arity selects the two-param header, and the
// `asserts` form discriminates the same way - each narrows to the selected header's target, never
// the first header's
declare function isType(v: unknown, kind: 'string'): v is string;
declare function isType(v: unknown, kind: 'array'): v is unknown[];
declare function isX(v: unknown): v is string;
declare function isX(v: unknown, deep: true): v is unknown[];
declare function assertT(v: unknown, kind: 'string'): asserts v is string;
declare function assertT(v: unknown, kind: 'array'): asserts v is unknown[];
export function byLiteral(v: unknown) {
  if (isType(v, 'array')) return _atMaybeArray(v).call(v, 0);
  return null;
}
export function byArity(v: unknown) {
  if (isX(v, true)) return _atMaybeArray(v).call(v, 1);
  return null;
}
export function byAsserts(v: unknown) {
  assertT(v, 'array');
  return _atMaybeArray(v).call(v, 2);
}