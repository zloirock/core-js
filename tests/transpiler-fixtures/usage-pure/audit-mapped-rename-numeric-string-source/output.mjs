import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// Quoted '0' is a string key. Only the numeric key survives the mapped filter.
type NumericFilter<K extends PropertyKey> = { [P in K as P extends number ? P : never]: number[] };
declare const r: NumericFilter<'0' | 1 | 'foo'> & {
  '0': string;
};
_atMaybeString(_ref = r['0']).call(_ref, 0);
_includesMaybeArray(_ref2 = r[1]).call(_ref2, 1);