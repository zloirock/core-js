import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Extract<A,B> / Exclude<A,B> semantics on primitive union. uses isAssignableTo which
// only compares outer constructor - `string | number` minus `string` via TS structural
// assignability can misfire on literal types.
type Nums = Extract<string | number, number>;
declare const n: Nums;
const s: string = 'abc';
_atMaybeString(s).call(s, n);