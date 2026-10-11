import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a write inside a pattern default runs only where its slot is undefined, and one inside the value
// of a logical assignment only where that assignment stores, so a read after either holds the
// binding's earlier value beside the written one; a read after the write inside the same default
// holds the written value alone
let A;
A = _Promise;
const {
  a = A = Object,
  tried = (A === _Promise ? _Promise$try : A.try.bind(A))(() => 1)
} = source;
let B = _Promise;
const [b = B = Object] = list;
export const resolvers = () => (B === _Promise ? _Promise$withResolvers : B.withResolvers.bind(B))();
let C = _Promise;
const memo = {};
memo.c ||= C = Object;
export const settled = () => (C === _Promise ? _Promise$allSettled : C.allSettled.bind(C))([]);
let D = _Promise;
const {
  d = (D = Object, D.any)
} = source;
export { tried, d };