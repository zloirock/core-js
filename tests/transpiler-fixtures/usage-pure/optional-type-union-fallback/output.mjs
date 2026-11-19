import _includes from "@core-js/pure/actual/instance/includes";
// The optional field can select a string fallback, even through a shared composite type.
// Both receiver families must remain available after the type annotations are erased.
type A = {
  list: string[];
};
type X<T> = A | A;
export function read<T>(x: Partial<X<T>>) {
  var _ref;
  return _includes(_ref = x.list ?? 'cat').call(_ref, 'at');
}