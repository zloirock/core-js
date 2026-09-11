import _at from "@core-js/pure/actual/instance/at";
// a transitive grandchild writes the inherited static field (`Leaf.data = ...`); the descendant set
// is closed recursively, not just direct subclasses, so the write still folds into the base static
// slot the base's method reads. the array narrow is unsound - degrade to the generic instance variant.
class Base {
  static data = [1, 2, 3];
  static read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  }
}
class Mid extends Base {}
class Leaf extends Mid {}
Leaf.data = "hello";