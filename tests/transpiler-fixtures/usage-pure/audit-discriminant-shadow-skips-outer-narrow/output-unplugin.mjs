import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// outer guard `if (f.kind === 'a')` does not leak narrowing into an inner block where
// `f` is shadowed by a different declaration. The inner `f` is a fresh binding with its
// own annotation, so its members resolve against the inner type (string) and the call
// dispatches to the generic `_at`. The discriminant-guard collection enforces a binding-
// identity check, rejecting guards whose root resolves to a different binding
type FooA = { kind: 'a'; data: number[] };
type FooB = { kind: 'b'; data: string };
type Foo = FooA | FooB;

declare const f: Foo;
if (f.kind === 'a') {
var _ref;
  const f: FooB = { kind: 'b', data: 'hello' };
  _atMaybeString(_ref = f.data).call(_ref, 0);
}