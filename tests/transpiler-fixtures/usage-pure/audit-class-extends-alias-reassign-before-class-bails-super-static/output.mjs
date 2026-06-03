// usage-pure: the superclass alias A is reassigned BEFORE the class, so `extends A` captures Object,
// not Array - `super.from` is Object.from. pure anchors its proof at the class node and sees the
// reassignment precede it, so it bails (no `_Array$from`). contrast the after-class sibling that resolves.
let A = Array;
A = Object;
class C extends A {
  static make() {
    return super.from([1, 2, 3]);
  }
}