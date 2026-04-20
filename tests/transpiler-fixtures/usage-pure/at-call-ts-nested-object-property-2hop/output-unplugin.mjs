import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type A = { b: { c: string[] } };
declare const a: A;
_atMaybeArray(_ref = a.b.c).call(_ref, -1);