// nested aliased unions: `type A = X | Y; type B = Z | W; type Outer = A | B`. the outer holds
// [A, B] but flatten expands to four branches [X, Y, Z, W]. a filter that survives 2 of 4 would
// FALSE-positive an all-pass drop if the baseline were the unflattened outer count (2 === 2).
// baselining on the FLATTENED count keeps the survivor pair and narrows accurately.
type X = { kind: 'a'; data: string };
type Y = { kind: 'b'; data: number[] };
type Z = { kind: 'c'; data: string };
type W = { kind: 'd'; data: number };
type A = X | Y;
type B = Z | W;
type Outer = A | B;
declare const o: Outer;
if (o.kind !== 'b' && o.kind !== 'd') {
  o.data.at(0);
}
