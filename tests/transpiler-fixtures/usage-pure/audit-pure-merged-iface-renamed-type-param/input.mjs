// pure interface merge across two declarations using different type-parameter
// names. the resolver must apply each sibling decl's own substitution because
// TypeScript does not require matching parameter names across merged
// declarations. without per-sibling subst, members from the renamed sibling
// retain raw type parameters and member calls bail to the generic polyfill.
interface Foo<T> { a: T }
interface Foo<U> { b: U }
declare const f: Foo<string[]>;
f.b.at(0);
