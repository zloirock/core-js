// Nested array+object reassign from a typed RHS: `[{ a }] = data` where
// `data: { a: number[] }[]` narrows `a` to `number[]`, so `a.includes(0)` emits the
// array-instance polyfill.
declare const data: { a: number[] }[];
let a;
[{ a }] = data;
a.includes(0);
