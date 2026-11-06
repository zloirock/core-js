// a -next-line inside a pattern, an object literal or a class body covers every member on the
// line below it, and the reprint lays members one per line: each covered member is led by its
// own directive in the output, so a second pass over it rewrites none of them. the member on the
// following line stays live and is the row proving the directive did not widen
const {
  // core-js-disable-next-line
  at, flat,
  includes,
} = arr;
use(at, flat, includes);
const o = {
  // core-js-disable-next-line
  k: b.findLast(f), j: c.toSorted(cmp),
  m: d.with(0, 1),
};
use(o);
class A {
  // core-js-disable-next-line
  m() { return e.toSpliced(0, 1); } n() { return g.findLastIndex(f); }
  o() { return h.fill(0); }
}
use(A);
