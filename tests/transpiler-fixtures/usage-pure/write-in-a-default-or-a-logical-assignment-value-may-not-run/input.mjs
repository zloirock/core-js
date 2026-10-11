// a write inside a pattern default runs only where its slot is undefined, and one inside the value
// of a logical assignment only where that assignment stores, so a read after either holds the
// binding's earlier value beside the written one; a read after the write inside the same default
// holds the written value alone
let A;
A = Promise;
const { a = (A = Object), tried = A.try(() => 1) } = source;
let B = Promise;
const [b = (B = Object)] = list;
export const resolvers = () => B.withResolvers();
let C = Promise;
const memo = {};
memo.c ||= (C = Object);
export const settled = () => C.allSettled([]);
let D = Promise;
const { d = (D = Object, D.any) } = source;
export { tried, d };
