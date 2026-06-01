import _Array$of from "@core-js/pure/actual/array/of";
// `this` capture inside a static method. An arrow keeps the enclosing `this` (the class ctor),
// so `this.of` there is inherited-static and emits `_Array$of.call(this, ...)`. A nested
// non-arrow function REBINDS `this`, so `this.from` inside it is not the class and stays native.
class A extends Array {
  static make() {
    const viaArrow = (() => _Array$of.call(this, 1, 2))();
    function nested() {
      return this.from([3]);
    }
    return [viaArrow, nested];
  }
}
A.make();