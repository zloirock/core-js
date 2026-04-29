import _Map from "@core-js/pure/actual/map/constructor";
// `class X implements Foo<T>` puts `Foo` in a type-only position (the implements clause).
// The implements reference is left as written so the clause keeps its type reference.
// `class X extends Foo<T>` shares the same node wrapper but in the super-class slot;
// that one is runtime and stays polyfilled
export class A extends _Map<string, number> {}
export class B implements Map<string, number> {}