// Extract<A,B> / Exclude<A,B> on a primitive union: assignability is compared by the
// outer constructor, so `string | number` narrowed to `number` correctly resolves; the
// `s.at(n)` call uses the string-specific instance polyfill
type Nums = Extract<string | number, number>;
declare const n: Nums;
const s: string = 'abc';
s.at(n);
