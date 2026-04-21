// Extract<A,B> / Exclude<A,B> semantics on primitive union. uses isAssignableTo which
// only compares outer constructor — `string | number` minus `string` via TS structural
// assignability can misfire on literal types.
type Nums = Extract<string | number, number>;
declare const n: Nums;
const s: string = 'abc';
s.at(n);
