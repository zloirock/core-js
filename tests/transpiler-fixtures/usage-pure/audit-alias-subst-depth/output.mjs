import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// nested TS alias substitution chain `A<T> -> B<T> -> C<T> -> T[]` resolves to
// `string[]`. Plugin selects the array-specific `at` and `flat` polyfills.
type A<T> = B<T>;
type B<T> = C<T>;
type C<T> = T[];
declare const a: A<string>;
_atMaybeArray(a).call(a, 0);
_flatMaybeArray(a).call(a);