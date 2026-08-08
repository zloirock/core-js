import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type SafeArr = string[] & { __brand: "safe" };
declare const x: SafeArr;
_atMaybeArray(x).call(x, -1);