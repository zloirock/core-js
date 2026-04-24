// nested TS alias substitution chain `A<T> -> B<T> -> C<T> -> T[]` resolves to
// `string[]`. Plugin selects the array-specific `at` and `flat` polyfills.
type A<T> = B<T>;
type B<T> = C<T>;
type C<T> = T[];
declare const a: A<string>;
a.at(0);
a.flat();
