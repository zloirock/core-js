// three-way interface merge, each sibling using a different type-parameter name.
// every sibling decl must build its OWN substitution map so the renamed slots
// (T / U / V) all resolve to the receiver's argument. without per-sibling subst,
// the second and third siblings carry raw renamed params and member calls fall
// through to the generic polyfill. at(0) on the third sibling property proves
// the V slot resolved to the receiver's string[] argument.
interface Foo<T> { a: T }
interface Foo<U> { b: U }
interface Foo<V> { c: V }
declare const f: Foo<string[]>;
f.c.at(0);
