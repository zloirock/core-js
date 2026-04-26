// `class X implements Foo<T>` puts `Foo` in a type-only position (TSExpressionWithTypeArguments
// inside `implements` listKey). polyfill replacement to `_Foo` would emit invalid TS - the
// `implements` clause requires a type, not a value import. `class X extends Foo<T>` shares
// the same wrapper but in `superClass` slot; that one is runtime and stays polyfilled
export class A extends Map<string, number> {}
export class B implements Map<string, number> {}
