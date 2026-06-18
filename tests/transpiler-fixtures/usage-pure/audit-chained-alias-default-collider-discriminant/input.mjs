// Discriminant-narrowed consumer of the chained-alias default collider: narrowing `o` to its
// `kind === 'k'` branch resolves the member through the same chain-keyed subst as a plain member
// access. Inner's default Q = A is the outer `type A = number[]` (Inner has no param A); the outer
// alias Outer<A> reuses the name A as its param, but that binding (string) must not leak into the
// inner alias's default scope. o.data narrows to number[], so the array at variant applies.
type A = number[];
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = {
  kind: 'k';
  data: Q;
};
declare const o: Outer<string>;
if (o.kind === 'k') {
  o.data.at(0);
}
