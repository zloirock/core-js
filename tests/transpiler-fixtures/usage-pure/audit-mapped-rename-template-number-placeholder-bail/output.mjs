import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// `${number}` placeholder must validate numeric shape per segment so alphabetic keys cannot leak in.
// Per-key dispatch is observable: numeric matches narrow via their value type, non-numeric keys drop.
type Pick2<T> = { [K in keyof T as K extends `id_${number}` ? K : never]: T[K] };
declare const r: Pick2<{
  id_42: string[];
  id_7e1: number[];
  id_abc: boolean;
  other: symbol;
}>;
_atMaybeArray(_ref = r.id_42).call(_ref, 0);
_includesMaybeArray(_ref2 = r.id_7e1).call(_ref2, 1);