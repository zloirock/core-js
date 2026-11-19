import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// Each inherited generic argument is substituted before the next parent is read.
declare class B<T> {
  m(): T
}
declare class M<U> extends B<U> {}
declare class C extends M<number[]> {}
_atMaybeArray(_ref = new C().m()).call(_ref, 0);