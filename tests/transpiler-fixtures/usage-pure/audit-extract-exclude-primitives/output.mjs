import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Extract<A,B> / Exclude<A,B> on a primitive union: assignability is compared by the
// outer constructor, so `string | number` narrowed to `number` correctly resolves; the
// `s.at(n)` call uses the string-specific instance polyfill
type Nums = Extract<string | number, number>;
declare const n: Nums;
const s: string = 'abc';
_atMaybeString(s).call(s, n);