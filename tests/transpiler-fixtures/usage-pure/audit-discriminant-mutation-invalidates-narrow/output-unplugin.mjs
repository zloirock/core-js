import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `let f` reassigned between the discriminant guard and the use site: outer narrowing
// from `if (f.kind === 'a')` is dropped (mutation check in `findDiscriminantGuards` -
// stale branch no longer reflects the binding's value), AND the new RHS shape narrows
// the union forward via `narrowUnionByAssignmentLiteral` matching the literal-typed
// `kind: 'b'` against FooB. result: `f.data` resolves to string (from FooB's `data`),
// emitting `_atMaybeString` instead of either the wrong array polyfill (no fix) or the
// generic `_at` (fix without forward-narrow)
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