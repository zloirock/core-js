// nested class with `super.method(...)` call: the static-method dispatch through the
// superclass still resolves to the correct pure-mode polyfill.
class A extends Map {
  static f() {
    class B extends Set {
      static g() { return super.from([1]); }
    }
    return super.groupBy([], x => x);
  }
}
