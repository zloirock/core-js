// an `enum globalThis` local to a static block shadows the realm name for the destructure beside it,
// so `{ Map: M } = globalThis` reads the enum's slot and the alias must not register as the Map
// constructor: the shadow question is asked at the USE path, where the block-local declaration is
// visible, not at the scope owner the block does not open
export class C {
  static {
    enum globalThis { A }
    const { Map: M } = globalThis;
    M.groupBy([1], x => x);
  }
}
