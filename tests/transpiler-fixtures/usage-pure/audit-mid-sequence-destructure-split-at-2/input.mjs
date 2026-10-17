// a destructure buried in a NESTED sequence slot splits too (fixpoint over the products)
let entries2;
((x(), ({ entries: entries2 } = Object)), use());
export const r3 = entries2({ b: 2 }).at(0);
