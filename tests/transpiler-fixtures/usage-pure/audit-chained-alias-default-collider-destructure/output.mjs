import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Destructure consumer of the chained-alias default collider: a destructured member of `Outer<string>`
// belongs to the inner alias, so the binding's type-param subst is keyed by the chain's terminal alias
// (Inner's params), not the top alias (Outer's). Inner's default Q = A is the outer `type A = number[]`
// (Inner has no param A); keying the top alias would let Outer's binding for A (string) capture that
// default. data is number[], so the array at variant applies, not the string variant.
type A = number[];
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = {
  data: Q;
};
declare const o: Outer<string>;
const {
  data
} = o;
_atMaybeArray(data).call(data, 0);