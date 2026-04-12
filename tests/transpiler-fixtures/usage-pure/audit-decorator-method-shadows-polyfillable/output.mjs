import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class A {
  @log
  at(i) {
    var _ref;
    return _atMaybeArray(_ref = []).call(_ref, i);
  }
}