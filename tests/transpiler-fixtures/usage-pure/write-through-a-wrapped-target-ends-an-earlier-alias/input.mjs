// a write through a wrapped target - a type assertion, a non-null assertion, parens the parser keeps -
// is a write of the binding like any other, so an earlier plain write is no longer its sole value: a
// later read sees the wrapped write's value
let A: any;
A = Map;
(A as any) = Object;
export const grouped = () => A.groupBy(items, key);
let B: any;
B = Promise;
B! = Iterator;
export const iterated = B.from(source);
let D: any;
D = Iterator;
(D) = Array;
export const listed = D.of(1);
