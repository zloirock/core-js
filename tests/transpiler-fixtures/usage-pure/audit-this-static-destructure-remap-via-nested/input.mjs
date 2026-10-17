class Outer extends Map {
  static o() {
    class Inner extends Array {
      static i() { const { from } = this; return from; }
    }
    return Inner.i();
  }
}
export const viaNested = Outer.o();
