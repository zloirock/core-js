// `this.X` in a static method of a class that extends Array - `this` is the class ctor, so
// unshadowed `this.of` resolves to Array.of and is emitted as `_Array$of.call(this, ...)`
// (same as `super.of`), keeping the subclass as the constructor for the result
class A extends Array {
  static make(x, y) {
    return this.of(x, y);
  }
}
A.make(1, 2);
