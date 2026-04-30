import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// User class used as namespace: ClassName.staticMethod returning array.
// resolveClassContext routes through resolveClassMember with isStatic = true.
class Foo {
  static make() {
    return [1, 2, 3];
  }
}
_atMaybeArray(_ref = Foo.make()).call(_ref, 0);