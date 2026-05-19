import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// nested aliased unions: `type A = X | Y; type B = Z | W; type Outer = A | B`.
// `aliased.types.length === 2` (outer holds [A, B]); flatten expands to four
// branches [X, Y, Z, W]. discriminant filter that survives 2 of 4 inner branches
// would FALSE-positive an all-pass drop if the baseline were the unflattened
// outer count - 2 === 2 would short-circuit narrow to identity. baselining on
// FLATTENED count keeps the survivor pair and narrows accurately
type X = {
  kind: 'a';
  data: string;
};
type Y = {
  kind: 'b';
  data: number[];
};
type Z = {
  kind: 'c';
  data: string;
};
type W = {
  kind: 'd';
  data: number;
};
type A = X | Y;
type B = Z | W;
type Outer = A | B;
declare const o: Outer;
if (o.kind !== 'b' && o.kind !== 'd') {
  var _ref;
  _atMaybeString(_ref = o.data).call(_ref, 0);
}