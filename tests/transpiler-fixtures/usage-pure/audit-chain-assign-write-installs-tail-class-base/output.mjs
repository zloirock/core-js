import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
let base = Object,
  b2;
base = b2 = _Iterator;
class Base extends base {
  static go() {
    return _Iterator$from.call(this, [1]);
  }
}
export const classBase = Base.go();