import _Map from "@core-js/pure/actual/map";
let box = {
    B: Object
  },
  x2;
box = x2 = {
  B: _Map
};
class Boxed extends box.B {
  static go() {
    return super.groupBy([], () => 1);
  }
}
export const classContainer = Boxed.go();