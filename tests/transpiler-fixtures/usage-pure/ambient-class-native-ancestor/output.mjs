import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Native instance identity survives multiple ambient ancestors.
declare class B extends Array<string> {}
declare class C extends B {}
_atMaybeArray(_ref = new C()).call(_ref, 0);