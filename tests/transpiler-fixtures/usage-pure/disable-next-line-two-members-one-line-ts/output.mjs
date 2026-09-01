import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _includes from "@core-js/pure/actual/instance/includes";
// the TypeScript member forms anchor like the plain ones: a modifier, a legacy decorator and a
// parameter property are all members the reprint lays one per line, so each covered one is led by
// its own directive and the member on the following line stays live. a parameter list shares a
// line, so a covered parameter property hands its directive to the constructor that hosts it
class A {
  // core-js-disable-next-line
  private m() {
    return a.at(0);
  }
  // core-js-disable-next-line
  public n() {
    return b.flat();
  }
  o() {
    return _includes(c).call(c, v);
  }
}
class B {
  // core-js-disable-next-line
  @dec
  m() {
    return d.toSorted(cmp);
  }
  // core-js-disable-next-line
  @dec
  n() {
    return e.findLast(f);
  }
  @dec
  o() {
    return _withMaybeArray(g).call(g, 0, 1);
  }
}
class C {
  // core-js-disable-next-line
  constructor(
  // core-js-disable-next-line
  public p = h.toSpliced(0, 1), private q = i.findLastIndex(f), readonly r = _fillMaybeArray(j).call(j, 0)) {}
}
use(A, B, C);