// three-way interface merge, each sibling using a different type-parameter name.
// every sibling decl needs its OWN type-arg subst so the renamed slots (T / U / V)
// all resolve to the receiver's argument; without it siblings 2 and 3 carry raw
// renamed params and member calls fall through to the generic polyfill. at(0) on
// the third sibling proves the V slot resolved to the receiver's string[] argument.
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<T> { a: T }
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<U> { b: U }
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<V> { c: V }
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const f: Foo<string[]>;
f.c.at(0);
