import _Array$from from "@core-js/pure/actual/array/from";
// optional call on a super method `super.m?.(...)`: the polyfill rewrite must respect
// the optional gate but still resolve through the superclass.
class A extends Array {
  static f() {
    _Array$from.call(this, "abc");
  }
}