import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// merged interface with renamed type-parameter whose sibling decl extends a
// generic parent passing the renamed parameter through. resolution must
// substitute the renamed parameter before recursing into the parent so the
// inherited property's element type reaches the call site.
interface Base<X> {
  read: X;
}
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<T> {
  a: T;
}
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Foo<U> extends Base<U> {}
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const f: Foo<string[]>;
_atMaybeArray(_ref = f.read).call(_ref, 0);