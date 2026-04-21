// nested alias substitution chain: A<T> -> B<T> -> C<T> -> T[]. verifies
// followTypeAliasChain accumulates subst across 3+ levels. expected Array.at.
type A<T> = B<T>;
type B<T> = C<T>;
type C<T> = T[];
declare const a: A<string>;
a.at(0);
a.flat();
