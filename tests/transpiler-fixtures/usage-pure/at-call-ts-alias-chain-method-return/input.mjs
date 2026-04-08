type B<U> = { get(): U };
type A = B<string>;
declare const a: A;
a.get().at(0);
