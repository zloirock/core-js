import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// Mirror of the chained-alias default collider, proving the fix follows the LEXICAL default rather than
// hardcoding the array variant. Here the outer `type A` is string, so the inner default Q = A is string.
// Outer<number[]> instantiates the param A to number[], but that instantiation binding must NOT leak into
// the inner alias's default scope - A there stays the lexical string. o.data is therefore string and the
// string at variant applies, the symmetric counterpart of the number[] cases resolving to the array variant.
type A = string;
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = {
  data: Q;
};
declare const o: Outer<number[]>;
_atMaybeString(_ref = o.data).call(_ref, 0);