import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// class + interface declaration merge where the interface sibling uses a renamed
// type-param. the class hop builds its subst from the receiver's typeArgs against
// the class type-param name; the interface hop must build its OWN subst against
// the renamed iface type-param. without per-source subst, the iface property
// would carry raw renamed param and the chained method call would bail to the
// generic polyfill. distinct methods (at vs includes) cover both hops.
declare class C<T> {
  a: T;
}
interface C<U> {
  b: U;
}
declare const c: C<string[]>;
_atMaybeArray(_ref = c.a).call(_ref, 0);
_includesMaybeArray(_ref2 = c.b).call(_ref2, "h");