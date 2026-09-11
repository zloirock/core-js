// cyclic alias-to-union: `type A = B | C; type B = A;`. expanding A resolves to the same
// UnionType identity through B, so without cycle protection the flattener recurses forever
// (RangeError). the walk must terminate on cycle hit, leaving the ref un-expanded; the filter
// then bails permissively and the array.at narrow flows through C's data correctly.
type C = {
  kind: 'c';
  data: string[];
};
type B = A;
type A = B | C;
declare const x: A;
if (x.kind === 'c') {
  x.data.at(0);
}
