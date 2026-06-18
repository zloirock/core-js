import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Multiple colliding defaults in one inner alias, each resolving INDEPENDENTLY to its own lexical type.
// Inner's defaults P = A and Q = B reference the outer `type A = number[]` and `type B = string` (Inner
// has neither A nor B as a param); the outer alias Outer<A, B> reuses both names as its params, but those
// instantiation bindings (A=string, B=number[]) must not leak into the inner defaults' scope. So a is
// number[] (array at variant) and b is string (string includes variant) - distinct methods on distinct
// members prove the two co-located defaults do not cross-contaminate.
type A = number[];
type B = string;
type Outer<A, B> = Inner<A, B>;
type Inner<X, Y, P = A, Q = B> = {
  a: P;
  b: Q;
};
declare const o: Outer<string, number[]>;
_atMaybeArray(_ref = o.a).call(_ref, 0);
_includesMaybeString(_ref2 = o.b).call(_ref2, 'x');