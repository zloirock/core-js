// Member-access consumer of the chained-alias default collider: the receiver `o.data` belongs to the
// inner alias, so its type-param subst must be keyed by the chain's TERMINAL alias (Inner's params),
// not the top alias (Outer's). Inner's default Q = A is the outer `type A = number[]` (Inner has no
// param A); keying the top alias would let Outer's instantiation binding for A (string) capture that
// default. o.data is number[], so the array at variant applies, not the string variant.
type A = number[];
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = {
  data: Q;
};
declare const o: Outer<string>;
o.data.at(0);
