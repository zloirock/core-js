// User class used as namespace: ClassName.staticMethod returning array.
// resolveClassContext routes through resolveClassMember with isStatic = true.
class Foo {
  static make() {
    return [1, 2, 3];
  }
}
Foo.make().at(0);
