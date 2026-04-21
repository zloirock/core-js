// mirror of `audit-static-block-this-inherits-super-polyfill` for the static-method form —
// `findEnclosingClassMember` treats both `static {}` and `static method()` as static ctx,
// so `this.of(1, 2)` resolves the same way as in a static block
class A extends Array {
  static make(x, y) {
    return this.of(x, y);
  }
}
A.make(1, 2);
