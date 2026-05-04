import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// NUMBER_LITERAL_RE accepts a leading minus, decimal fractions, and exponents but rejects
// hex / octal / BigInt suffix. Probe edge segments after the literal 'v_' prefix:
//   v_-1   - leading '-' allowed -> match,  Tag keeps key, value number[] -> array narrowing
//   v_3.14 - decimal fraction allowed -> match, Tag keeps key, value string[] -> array narrowing
//   v_0x10 - hex literal not in the simple regex -> drop, key absent from Tag -> generic emit
//   v_42n  - BigInt literal suffix not allowed -> drop, key absent from Tag -> generic emit
// matched keys emit array-narrowed `_atMaybeArray` / `_includesMaybeArray`; dropped keys
// fall back to generic `_at` / `_includes` because the resolver can't find them in the
// post-rename Tag shape. distinct methods per line make the contrast observable
type Tag<T> = { [K in keyof T as K extends `v_${ number }` ? K : never]: T[K] };
declare const r: Tag<{ 'v_-1': number[]; 'v_3.14': string[]; 'v_0x10': boolean; 'v_42n': symbol }>;
_atMaybeArray(_ref = r['v_-1']).call(_ref, 0);
_includesMaybeArray(_ref2 = r['v_3.14']).call(_ref2, 'a');
_at(_ref3 = r['v_0x10']).call(_ref3, 1);
_includes(_ref4 = r['v_42n']).call(_ref4, 0);