import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// User class used as a namespace: `Foo.make()` returns an array via a static method.
// Class context must route to the static-member path so the result narrows to Array.
class Foo {
  static make() {
    return [1, 2, 3];
  }
}
_atMaybeArray(_ref = Foo.make()).call(_ref, 0);