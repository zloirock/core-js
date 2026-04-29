import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `findDiscriminantGuards` must flatten `&&` (truthy) / `||` (falsy) chains so a
// discriminant clause embedded alongside other tests still narrows. without the flatten
// `if (ready && f.kind === 'a')` reaches `parseDiscriminantCheck` with a LogicalExpression
// (not a BinaryExpression) and the guard is silently dropped - leaving Foo unfolded and
// emitting generic `_at` instead of `_atMaybeArray` on the FooA branch
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const f: Foo;
declare const ready: boolean;
if (ready && f.kind === 'a') {
var _ref;
  _atMaybeArray(_ref = f.data).call(_ref, 0);
}