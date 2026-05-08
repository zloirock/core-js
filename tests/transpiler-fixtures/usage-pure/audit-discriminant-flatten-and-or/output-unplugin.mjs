import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// discriminant-guard collection flattens `&&` (truthy) / `||` (falsy) chains so a
// discriminant clause embedded alongside other tests still narrows. Flattening unwraps
// `if (ready && f.kind === 'a')` to the inner equality check; the guard is recognised,
// Foo folds to FooA, and `_atMaybeArray` emits on the narrowed branch
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const f: Foo;
declare const ready: boolean;
if (ready && f.kind === 'a') {
  var _ref;
  _atMaybeArray(_ref = f.data).call(_ref, 0);
}