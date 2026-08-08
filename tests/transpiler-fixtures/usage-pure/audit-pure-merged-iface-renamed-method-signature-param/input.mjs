// merged interface with renamed type-parameter on a method-signature return type
// (not a plain property). per-sibling subst must reach the renamed `U` inside the
// returned type annotation, otherwise the method's return is left as raw type-param
// and the chained call on the result drops to the generic polyfill. at picks the
// array-narrow variant when the renamed param resolves to `string[]`.
interface Foo<T> { a(): T }
interface Foo<U> { b(): U }
declare const f: Foo<string[]>;
f.b().at(0);
