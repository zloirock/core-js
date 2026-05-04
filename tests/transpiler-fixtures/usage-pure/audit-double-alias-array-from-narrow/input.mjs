// Double alias chain through polyfilled static method must still narrow receiver type.
// `const a = Array.from; const b = a;` then `b('x').at(-1)` -> resolver must walk both
// alias hops to recognise the call returns Array, picking `_atMaybeArray` not generic `_at`.
// Distinct methods (at, findLast, copyWithin) confirm that each call site independently
// resolves through the same chain.
const a = Array.from;
const b = a;
const arr = b('hi');
arr.at(-1);
arr.findLast(x => x);
arr.copyWithin(0, 1);
