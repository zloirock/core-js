import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// @flow
// A proto field belongs to the ancestor prototype; the nearer method owns this read.
declare class B {
  proto m: () => number[] | string
}
declare class C extends B {
  m(): string
}
_atMaybeString(_ref = new C().m()).call(_ref, 0);