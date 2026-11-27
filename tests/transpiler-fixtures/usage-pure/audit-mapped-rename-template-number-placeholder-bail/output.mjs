import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3;
// Decimal, exponential and leading-zero text match a numeric template. Alphabetic text does not.
type Pick2<T> = { [K in keyof T as K extends `id_${number}` ? K : never]: T[K] };
declare const r: Pick2<{
  id_42: string[];
  id_7e1: number[];
  id_08: string[];
  id_abc: boolean;
  other: symbol;
}>;
_atMaybeArray(_ref = r.id_42).call(_ref, 0);
_includesMaybeArray(_ref2 = r.id_7e1).call(_ref2, 1);
_atMaybeArray(_ref3 = r.id_08).call(_ref3, -1);