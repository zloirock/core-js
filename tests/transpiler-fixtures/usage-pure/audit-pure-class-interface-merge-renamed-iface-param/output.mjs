import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// class + interface declaration merge where the interface sibling uses a renamed type-param.
// the class hop binds the receiver's type-args against the class type-param name; the interface
// hop must bind its OWN against the renamed iface type-param. without per-source binding the
// iface property carries a raw renamed param and the chained call bails to the generic polyfill.
// distinct methods (at vs includes) cover both hops.
// @ts-expect-error merged declarations tsc refuses are the shape under test
declare class C<T> {
  a: T;
}
// @ts-expect-error merged declarations tsc refuses are the shape under test
interface C<U> {
  b: U;
}
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const c: C<string[]>;
_atMaybeArray(_ref = c.a).call(_ref, 0);
_includesMaybeArray(_ref2 = c.b).call(_ref2, "h");