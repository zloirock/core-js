import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// @flow
// An ambient class can inherit a native array through another ambient class.
declare class B extends Array<string> {}
declare class C extends B {}
_atMaybeArray(_ref = new C()).call(_ref, 0);