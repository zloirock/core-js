import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// `${number}` placeholder must validate numeric shape per segment so alphabetic keys cannot leak in.
// Per-key dispatch is observable: numeric matches narrow via their value type, non-numeric keys drop.
// canonical: a canonical integer (`42`) and an exponential (`7e1`) match, but a leading-zero integer
// (`08`) does NOT - TS's `${number}` rejects the non-canonical form, so it must bail to the generic helper.
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
_at(_ref3 = r.id_08).call(_ref3, -1);