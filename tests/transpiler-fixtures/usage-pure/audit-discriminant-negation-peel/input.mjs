// `parseDiscriminantCheck` must peel a leading `!` UnaryExpression so
// `if (!(f.kind === 'b'))` narrows identically to `if (f.kind !== 'b')`. without the peel
// the test reaches the BinaryExpression early-return as UnaryExpression and the guard is
// dropped, leaving Foo unfolded - the wrong polyfill (`_at` generic instead of
// `_atMaybeArray`) is emitted on the surviving FooA branch
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const f: Foo;
if (!(f.kind === 'b')) {
  f.data.at(0);
}
