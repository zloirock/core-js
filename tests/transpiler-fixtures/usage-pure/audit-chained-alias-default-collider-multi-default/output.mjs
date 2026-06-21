import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// two colliding defaults in one inner alias, each resolving INDEPENDENTLY to its own lexical type.
// Inner's `P = A` / `Q = B` reference the outer `type A = number[]` / `type B = string`, while
// Outer<A, B> reuses both names as params; those instantiation bindings must NOT leak into the inner
// defaults' scope. so `a` is number[] (array .at) and `b` is string (string .includes) - no cross-contamination
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