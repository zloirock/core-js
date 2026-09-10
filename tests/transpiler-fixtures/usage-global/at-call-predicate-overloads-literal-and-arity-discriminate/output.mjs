import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
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
  if (isType(v, 'array')) return v.at(0);
  return null;
}
export function byArity(v: unknown) {
  if (isX(v, true)) return v.includes(1);
  return null;
}
export function byAsserts(v: unknown) {
  assertT(v, 'array');
  return v.map(x => x);
}