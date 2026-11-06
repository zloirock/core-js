import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class BuiltInBase extends Array {
  cells = [1, 2];
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.cells).call(_ref, 0);
  }
}
new BuiltInBase().read();