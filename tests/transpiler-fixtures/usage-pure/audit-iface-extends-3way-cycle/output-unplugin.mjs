import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// 3-way mutual extends cycle (A->B->C->A); cycle detection must bail before depth limit.
// Verifies the local member `aProp: number[]` is still resolvable despite the inheritance loop.
interface A extends B { aProp: number[] }
interface B extends C { bProp: number[] }
interface C extends A { cProp: number[] }
declare const x: A;
_atMaybeArray(_ref = x.aProp).call(_ref, 0);