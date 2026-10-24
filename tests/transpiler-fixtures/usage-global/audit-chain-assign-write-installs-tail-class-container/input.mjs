let box = { B: Object }, x2;
box = x2 = { B: Map };
class Boxed extends box.B {
  static go() { return super.groupBy([], () => 1); }
}
export const classContainer = Boxed.go();
