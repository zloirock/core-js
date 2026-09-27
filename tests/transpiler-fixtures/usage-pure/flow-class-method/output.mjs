import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// An ambient instance method keeps its declared array return.
declare class C {
  m(): number[]
}
_atMaybeArray(_ref = new C().m()).call(_ref, 0);