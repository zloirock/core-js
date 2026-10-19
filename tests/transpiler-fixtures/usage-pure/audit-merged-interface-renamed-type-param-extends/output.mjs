import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// class+interface merging with renamed type-param, where the interface extends another
// generic interface threading the renamed param: `class C<T>` + `interface C<U> extends
// Base<U>`. the iface-subst (`U -> string[]`) must be applied to `Base<U>` BEFORE
// descending into Base's members, otherwise Base's parentSubst gets a raw `U` reference
// instead of the receiver's substituted type
interface Base<X> {
  read: X;
}
// @ts-expect-error merged declarations tsc refuses are the shape under test
class Container<T> {
  ping(): T {
    return null!;
  }
}
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface Container<U> extends Base<U> {}
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const c: Container<string[]>;
_atMaybeArray(_ref = c.read).call(_ref, 0);