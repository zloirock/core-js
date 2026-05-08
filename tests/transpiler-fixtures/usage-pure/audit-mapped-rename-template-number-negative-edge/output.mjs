import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// `${number}` placeholder accepts signed/decimal/exponent forms but rejects hex/BigInt literals.
// Matched keys narrow via the value type; rejected keys fall back to generic instance polyfills.
type Tag<T> = { [K in keyof T as K extends `v_${number}` ? K : never]: T[K] };
declare const r: Tag<{
  'v_-1': number[];
  'v_3.14': string[];
  'v_0x10': boolean;
  'v_42n': symbol;
}>;
_atMaybeArray(_ref = r['v_-1']).call(_ref, 0);
_includesMaybeArray(_ref2 = r['v_3.14']).call(_ref2, 'a');
_at(_ref3 = r['v_0x10']).call(_ref3, 1);
_includes(_ref4 = r['v_42n']).call(_ref4, 0);