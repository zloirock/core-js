import _Array$of from "@core-js/pure/actual/array/of";
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() {
    return _Array$of.call(this, 1);
  }
}
export const viaExtends = R6.go();