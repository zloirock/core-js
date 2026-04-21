import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// nested alias substitution chain: A<T> -> B<T> -> C<T> -> T[]. verifies
// followTypeAliasChain accumulates subst across 3+ levels. expected Array.at.
type A<T> = B<T>;
type B<T> = C<T>;
type C<T> = T[];
declare const a: A<string>;
_atMaybeArray(a).call(a, 0);
_flatMaybeArray(a).call(a);