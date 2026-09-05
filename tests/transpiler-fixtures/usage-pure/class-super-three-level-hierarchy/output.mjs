import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static m() {
    return _Array$from.call(this, []);
  }
}
class B extends A {
  static n() {
    return super.m();
  }
}
class C extends B {
  static o() {
    return super.n();
  }
}