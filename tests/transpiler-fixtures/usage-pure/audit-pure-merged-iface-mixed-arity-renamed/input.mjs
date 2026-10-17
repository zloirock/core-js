// mixed-arity interface merge: one sibling declares a type-param under a renamed
// name, the other has zero type-params and a fully-resolved property type. the
// zero-arity sibling must accept the receiver's type-args without trying to bind
// them - the subst map is empty when the sibling has no type-params, so it passes
// through unchanged. distinct methods (at vs includes) prove each line walked
// through its own sibling without cross-contamination.
interface Foo<T> { a: T }
interface Foo { b: number[] }
declare const f: Foo<string[]>;
f.a.at(0);
f.b.includes(1);
