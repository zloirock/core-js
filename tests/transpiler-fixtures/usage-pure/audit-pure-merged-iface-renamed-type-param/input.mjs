// pure interface merge across two declarations using different type-parameter
// names. the resolver must apply each sibling decl's own substitution because
// TypeScript does not require matching parameter names across merged
// declarations. without per-sibling subst, members from the renamed sibling
// retain raw type parameters and member calls bail to the generic polyfill.
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<T> { a: T }
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<U> { b: U }
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const f: Foo<string[]>;
f.b.at(0);
