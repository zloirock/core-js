import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
class Foo {
  get sorted() {
    var _ref;
    return _toSortedMaybeArray(_ref = [3, 1, 2]).call(_ref);
  }
}