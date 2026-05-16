import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested-alias union: `type A = X | Y; type B = Z; type Outer = A | B | null`. tests
// the recursive `flattenUnionBranches` walk: outer types = [A, B, null]; A flattens to
// [X, Y], B stays Z, null excluded. final flat list [X, Y, Z] hits the discriminant
// filter element-wise. without the recursive flatten only one level would expand, leaving
// A-as-ref opaque to the filter.
type X = {
  kind: 'a';
  data: string[];
};
type Y = {
  kind: 'b';
  data: number;
};
type Z = {
  kind: 'c';
  data: boolean;
};
type A = X | Y;
type Outer = A | Z | null;
declare const x: Outer;
if (x.kind === 'a') {
  var _ref;
  _atMaybeArray(_ref = x.data).call(_ref, 0);
}