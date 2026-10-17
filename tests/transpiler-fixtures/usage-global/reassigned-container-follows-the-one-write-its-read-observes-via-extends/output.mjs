import "core-js/modules/es.array.of";
let base6 = Object;
base6 = Array;
class R6 extends base6 {
  static go() {
    return super.of(1);
  }
}
export const viaExtends = R6.go();