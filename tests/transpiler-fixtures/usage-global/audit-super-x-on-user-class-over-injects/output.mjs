// `class B extends A` where A is a user-defined class with its own static `at`. `super.at(0)`
// resolves to A.at at runtime, not Array.prototype.at - the inherited-static walk returns null
// for user-classes (no global hint), and dispatch correctly bails on instance-prototype fallback
// so `es.array.at` / `es.string.at` aren't injected for an unrelated user-class member
class A {
  static at(i) {
    return -1;
  }
}
class B extends A {
  static foo() {
    return super.at(0);
  }
}
B.foo();