// three-level alias chain through two identity mapped types `Outer<T> -> Middle<T> -> Inner<T> -> T`.
// type-narrowing must walk the chain so `a.at(0)` rewrites to the array-specific instance
// polyfill rather than the generic one.
type Inner<T> = { [K in keyof T]: T[K] };
type Middle<T> = Inner<T>;
type Outer<T> = { [K in keyof Middle<T>]: Middle<T>[K] };
declare const a: Outer<string[]>;
a.at(0);
