import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.with";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.symbol.metadata";
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
    return c.includes(v);
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
    return g.with(0, 1);
  }
}
class C {
  // core-js-disable-next-line
  constructor(
  // core-js-disable-next-line
  public p = h.toSpliced(0, 1), private q = i.findLastIndex(f), readonly r = j.fill(0)) {}
}
use(A, B, C);