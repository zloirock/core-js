import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `let f` reassigned between the discriminant guard and the use site: outer narrowing
// from `if (f.kind === 'a')` is dropped (the discriminant-guard collection sees the
// mutation and treats the stale branch as no longer reflecting the binding's value),
// AND the new RHS shape narrows the union forward by matching the literal-typed
// `kind: 'b'` against FooB. Result: `f.data` resolves to string (from FooB's `data`),
// emitting `_atMaybeString` instead of either the wrong array polyfill (without the
// mutation check) or the generic `_at` (with the mutation check but no forward-narrow)
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const init: Foo;
let f: Foo = init;
if (f.kind === 'a') {
  var _ref;
  f = { kind: 'b', data: 'mutated' };
  _atMaybeString(_ref = f.data).call(_ref, 0);
}