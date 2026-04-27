// outer guard `if (f.kind === 'a')` must NOT leak narrowing into an inner block where
// `f` is shadowed by a different declaration. the inner `f` is a fresh binding with its
// own annotation; resolving its members against the outer-narrowed branch would emit
// `_atMaybeArray` for what is actually a string. binding-identity check in
// `findDiscriminantGuards` rejects guards whose root resolves to a different binding
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const f: Foo;
if (f.kind === 'a') {
  const f: FooB = { kind: 'b', data: 'hello' };
  f.data.at(0);
}
