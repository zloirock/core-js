class A extends Array {
  static m() { return super.from([]); }
}
class B extends A {
  static n() { return super.m(); }
}
class C extends B {
  static o() { return super.n(); }
}
