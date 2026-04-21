import _Array$of from "@core-js/pure/actual/array/of";
// mirror of `audit-static-block-this-inherits-super-polyfill` for the static-method form —
// `findEnclosingClassMember` treats both `static {}` and `static method()` as static ctx,
// so `this.of(1, 2)` resolves the same way as in a static block
class A extends Array {
  static make(x, y) {
    return _Array$of(x, y);
  }
}
A.make(1, 2);