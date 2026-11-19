// discriminant-check parsing peels a leading `!` so `if (!(f.kind === 'b'))` narrows
// identically to `if (f.kind !== 'b')`. The peel exposes the inner equality so the guard
// folds Foo to FooA on the inner block and `_atMaybeArray` emits on the surviving branch
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const f: Foo;
if (!(f.kind === 'b')) {
  f.data.at(0);
}
