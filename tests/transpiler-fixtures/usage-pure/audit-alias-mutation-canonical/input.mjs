// const-alias receivers are canonicalized across every value-flow shape (direct,
// alias-of-alias, static-object member, class static field). a mutated static routes
// through the injected constructor so the patch and every read share one ponyfill object;
// a clean alias instead substitutes the receiver-less import
const A = Array;
A.from = custom;
const r = A.from([1]);
const b = A;
b.of = custom2;
const r2 = b.of(1);
const NS = { M: Map };
const m = NS.M;
m.groupBy = custom3;
const r3 = Map.groupBy(r2, fn);
class CS { static I = Iterator; }
const it = CS.I;
it.from = custom4;
const r4 = Iterator.from(r);
const P = Promise;
const r5 = P.try(fn);
