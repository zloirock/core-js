import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// an overloaded METHOD predicate is a set too: every same-named member of the receiver's type takes
// part in the selection, and the literal picks the array header over the declaration-first string one
interface C {
  isKind(v: unknown, k: 'string'): v is string;
  isKind(v: unknown, k: 'array'): v is unknown[];
}
declare const c: C;
export function f(v: unknown) {
  if (c.isKind(v, 'array')) return _atMaybeArray(v).call(v, 0);
  return null;
}