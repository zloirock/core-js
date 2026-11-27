import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// The optional field can select a string fallback, even through a shared composite type.
// Both receiver families must remain available after the type annotations are erased.
type A = {
  list: string[];
};
type X<T> = T extends number ? A : A;
export function read<T>(x: Partial<X<T>>) {
  var _ref;
  return _includes(_ref = x.list ?? 'cat').call(_ref, 'at');
}
export function first<T>(x: Partial<X<T>>) {
  var _ref2;
  return _atMaybeArray(_ref2 = x.list ?? ['cat']).call(_ref2, 0);
}