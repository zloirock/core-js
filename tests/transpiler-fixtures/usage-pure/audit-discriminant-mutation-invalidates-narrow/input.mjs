// `let f` reassigned between a discriminant guard and the use site: the original
// guard's narrow must be dropped, AND the new RHS shape must forward-narrow the
// union. `f.data` ends up as string (from the post-reassignment branch)
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const init: Foo;
let f: Foo = init;
if (f.kind === 'a') {
  f = { kind: 'b', data: 'mutated' };
  f.data.at(0);
}
