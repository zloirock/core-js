import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// a Flow `declare class` parent carries its members on a Flow object-type body, not a class
// body. resolving the inherited method's return type through that parent narrows `.at` to the
// array-only pure helper instead of the general instance helper
declare class P {
  method(): number[]
}
class C extends P {}
_atMaybeArray(_ref = new C().method()).call(_ref, 0);