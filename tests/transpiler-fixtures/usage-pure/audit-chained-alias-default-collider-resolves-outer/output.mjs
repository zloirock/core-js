import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A chained generic alias whose inner alias declares a type-param DEFAULT (Q = A) referencing an outer
// type named A. The outer alias Outer<A> reuses the name A as its OWN type-param, but that instantiation
// binding must NOT leak into the inner alias's default scope: A there is lexically the outer
// `type A = number[]` (the inner alias has no param A). v therefore narrows to number[] and the array at
// variant applies, not the string variant that the leaked outer-param binding (string) would force.
type A = number[];
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = Q;
declare const v: Outer<string>;
_atMaybeArray(v).call(v, 0);