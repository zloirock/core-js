import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// Deliberately inconsistent declarations: an ancestor own field shadows the child method.
declare class B {
  m: () => number[]
}
declare class C extends B {
  m(): string
}
_atMaybeArray(_ref = new C().m()).call(_ref, 0);