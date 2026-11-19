import _Iterator from "@core-js/pure/actual/iterator";
let base = Object,
  b2;
base = b2 = _Iterator;
class Base extends base {
  static go() {
    return super.from([1]);
  }
}
export const classBase = Base.go();