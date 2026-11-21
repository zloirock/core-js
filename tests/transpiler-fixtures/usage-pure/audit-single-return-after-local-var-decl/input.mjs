// Unrelated var / let / const declarations stay inside the call and permit resolving its return.
// Function and class declarations remain outside the admitted body grammar.
const a = (() => { var local = 1; return Map; })().from([1]);
const b = (() => { let local = 1; return Set; })().of(2);
const c = (() => { const local = 1; return Map; })().of(3);
const d = (() => { function local() {} return Set; })().of(4);
const e = (() => { class Local {} return Map; })().of(5);
export { a, b, c, d, e };
export const kinds = [
  (() => { var local = 1; return Array; })().from([1]),
  (() => { let local = 1; return Array; })().from([2]),
  (() => { const local = 1; return Array; })().from([3]),
  (() => { function local() {} return Array; })().from([4]),
  (() => { class Local {} return Array; })().from([5]),
];
