import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
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
const NS = {
  M: _Map
};
const m = NS.M;
m.groupBy = custom3;
const r3 = _Map.groupBy(r2, fn);
class CS {
  static I = _Iterator;
}
const it = CS.I;
it.from = custom4;
const r4 = _Iterator.from(r);
const P = _Promise;
const r5 = _Promise$try(fn);