// nested-alias union: `type A = X | Y; type B = Z; type Outer = A | B | null`. the recursive
// flatten walk turns outer [A, B, null] into [X, Y, Z] (A expands, B stays Z, null excluded), so
// the discriminant filter sees each branch element-wise. without the recursion only one level
// expands, leaving A-as-ref opaque to the filter.
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
  x.data.at(0);
}
