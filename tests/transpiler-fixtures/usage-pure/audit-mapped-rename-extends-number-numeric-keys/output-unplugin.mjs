import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// `K extends number` rename predicate matches numeric-shape string keys produced by
// keyof-source enumeration; non-numeric keys fall through to the never branch
type NumOnly<T> = { [K in keyof T as K extends number ? K : never]: T[K] };
declare const r: NumOnly<{ 0: number[]; 1: string[]; alpha: boolean }>;
_atMaybeArray(_ref = r[0]).call(_ref, 0);
_includesMaybeArray(_ref2 = r[1]).call(_ref2, 'a');