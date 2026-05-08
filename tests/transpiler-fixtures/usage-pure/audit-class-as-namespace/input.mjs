// User class used as a namespace: `Foo.make()` returns an array via a static method.
// Class context must route to the static-member path so the result narrows to Array.
class Foo {
  static make() {
    return [1, 2, 3];
  }
}
Foo.make().at(0);
