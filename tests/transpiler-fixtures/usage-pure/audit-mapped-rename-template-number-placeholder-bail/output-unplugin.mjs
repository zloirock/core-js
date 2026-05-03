import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// matchTemplatePattern recognises `${string}` (any chars) and `${number}` (number-literal-
// shaped segment) placeholders. for `K extends \`id_\${number}\``:
//   K = 'id_42'   - prefix 'id_' + segment '42' is a valid number literal -> match, key kept
//   K = 'id_7e1'  - prefix 'id_' + segment '7e1' is exponential number -> match, key kept
//   K = 'id_abc'  - prefix 'id_' + segment 'abc' fails number-literal regex -> no match, key dropped
//   K = 'other'   - doesn't start with 'id_' -> no match, key dropped
// per-segment validation prevents `${number}` from over-matching alphabetic keys that
// only `${string}` would tolerate. distinct methods per line surface per-key dispatch:
// `id_42.at` (string[] array.at) and `id_7e1.includes` (number[] array.includes)
type Pick2<T> = { [K in keyof T as K extends `id_${ number }` ? K : never]: T[K] };
declare const r: Pick2<{ id_42: string[]; id_7e1: number[]; id_abc: boolean; other: symbol }>;
_atMaybeArray(_ref = r.id_42).call(_ref, 0);
_includesMaybeArray(_ref2 = r.id_7e1).call(_ref2, 1);