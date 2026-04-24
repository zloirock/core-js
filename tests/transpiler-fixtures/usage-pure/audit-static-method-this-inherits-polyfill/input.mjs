// `this.X` in a static method of a class that extends Array - `this` is the class ctor,
// unshadowed `this.of` reads the super-class's static surface (Array.of). plugin polyfills
// through Array.of, same as it would for `super.of` or `this.of` in a static block
class A extends Array {
  static make(x, y) {
    return this.of(x, y);
  }
}
A.make(1, 2);
