import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Indexed-access consumer of the chained-alias default collider (companion to the direct-member case):
// this routes the receiver type through the alias-chain walker rather than the direct user-type
// resolver. Inner's default Q = A is the outer `type A = number[]` (Inner has no param A); the outer
// alias Outer<A> reuses the name A as its param, but that instantiation binding must not leak into the
// inner alias's default scope through the chain. Outer<string>['d'] is number[], so array at applies.
type A = number[];
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = {
  d: Q;
};
declare const v: Outer<string>['d'];
_atMaybeArray(v).call(v, 0);