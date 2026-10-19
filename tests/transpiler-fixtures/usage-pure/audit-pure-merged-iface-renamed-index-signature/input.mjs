// merged interface, one sibling renames its type-param inside an index signature,
// the other on a named property. per-sibling type-arg subst must reach both shapes
// so any-string-key access resolves to the index-signature value type and named
// access to the renamed property type. at vs includes show which sibling each walked.
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<T> { [k: string]: T }
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<U> { otherProp: U }
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const f: Foo<string[]>;
f.otherProp.at(0);
f.anyDynamicKey.includes("x");
