// the monkey-patch pre-pass canonicalizes const-alias receivers across every value-flow
// shape the read side resolves (direct, alias-of-alias, static-object member, class static
// field). a mutated static never binds to the frozen receiver-less import: the constructor
// substitutes instead, so the patch and every read share the injected ponyfill object - on
// targets where the native global exists the emission stays native end-to-end (same effect),
// and where it is missing the code still runs. a clean alias substitutes receiver-less
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
