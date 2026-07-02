import _Array$from from "@core-js/pure/actual/array/from";
// usage-pure counterpart: `class C extends A` with `super.from(...)` where the superclass alias A is
// reassigned AFTER the class - `extends` captured Array at class-definition, so super.from is provably
// Array.from and pure substitutes `_Array$from`. pure anchors the reassignment proof at the class node
// (the capture point), so a post-class reassignment still resolves; mirror of the usage-global counterpart.
let A = Array;
class C extends A {
  static make() {
    return _Array$from.call(this, [1, 2, 3]);
  }
}
A = Object;