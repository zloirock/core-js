import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// A method binds its own type parameter from the call argument.
declare class C {
  m<T>(x: T): T
}
_atMaybeArray(_ref = new C().m([1])).call(_ref, 0);