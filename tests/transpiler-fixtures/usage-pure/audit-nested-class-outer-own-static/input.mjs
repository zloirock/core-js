// Outer class has its own `from` static; inner class is defined inside a static method
// of the outer and has no `from`. The inner `super.from(x)` should polyfill to Array.from
// (it extends Array), and the outer's static `from` should not interfere with resolving
// the inner's super chain. `isShadowedByClassOwnMember` only looks at the class-body
// directly enclosing the `this`/`super` call, so the outer's shadow is scoped correctly.
class Outer extends Promise {
  static from(iter) { return [...iter]; }
  static run() {
    class Inner extends Array {
      static load(x) { return super.from(x); }
    }
    return Inner.load([1, 2]);
  }
}
