import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// mutual interface extends (A extends B, B extends A) must terminate via depth-cap
// without losing per-interface own members; both `aProp` and `bProp` resolve as Array
interface A extends B {
  aProp: number[];
}
interface B extends A {
  bProp: string[];
}
declare const o: A;
_atMaybeArray(_ref = o.aProp).call(_ref, 0);
_includesMaybeArray(_ref2 = o.bProp).call(_ref2, "x");