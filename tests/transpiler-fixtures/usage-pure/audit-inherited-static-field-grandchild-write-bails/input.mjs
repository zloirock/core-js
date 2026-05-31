// a transitive grandchild writes the inherited static field (`Leaf.data = ...`); the descendant set
// is closed recursively, not just direct subclasses, so the write still folds into the base static
// slot the base's method reads. the array narrow is unsound - degrade to the generic instance variant.
class Base {
  static data = [1, 2, 3];
  static read() { return this.data.at(0); }
}
class Mid extends Base {}
class Leaf extends Mid {}
Leaf.data = "hello";
