import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
let box = {
    B: Object
  },
  x2;
box = x2 = {
  B: _Map
};
class Boxed extends box.B {
  static go() {
    return _Map$groupBy.call(this, [], () => 1);
  }
}
export const classContainer = Boxed.go();