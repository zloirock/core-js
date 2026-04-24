import _Promise from "@core-js/pure/actual/promise/constructor";
import _Array$from from "@core-js/pure/actual/array/from";
// outer class has its own static `from` (shadowing Promise.from); inner class is declared
// inside outer's static method and extends Array. inner's `super.from(x)` resolves to
// Array.from - outer's own shadow is scoped to outer's body and doesn't leak into inner.
// each class body has its own own-member view for shadow detection
class Outer extends _Promise {
  static from(iter) {
    return [...iter];
  }
  static run() {
    class Inner extends Array {
      static load(x) {
        return _Array$from.call(this, x);
      }
    }
    return Inner.load([1, 2]);
  }
}