import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// Decimal and hexadecimal strings match a numeric template. A BigInt suffix does not.
type Tag<T> = { [K in keyof T as K extends `v_${number}` ? K : never]: T[K] };
declare const r: Tag<{
  'v_-1': number[];
  'v_3.14': string[];
  'v_0x10': boolean;
  'v_42n': symbol;
}>;
_atMaybeArray(_ref = r['v_-1']).call(_ref, 0);
_includesMaybeArray(_ref2 = r['v_3.14']).call(_ref2, 'a');
// @ts-expect-error the member read is the probe, and the right answer is a type without it
r['v_0x10'].at(1);
_includes(_ref3 = r['v_42n']).call(_ref3, 0);