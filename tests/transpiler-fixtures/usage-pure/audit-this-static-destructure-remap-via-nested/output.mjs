import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
class Outer extends _Map {
  static o() {
    class Inner extends Array {
      static i() {
        const from = _Array$from;
        return from;
      }
    }
    return Inner.i();
  }
}
export const viaNested = Outer.o();