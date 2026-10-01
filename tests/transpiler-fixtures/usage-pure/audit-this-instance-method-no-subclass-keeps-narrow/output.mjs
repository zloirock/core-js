import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// No subclass overrides the instance method, so the `this.makeItems()` return stays narrowed
// to the array element variant (precision boundary for the subclass-shadow bail).
class Base {
  makeItems(): number[] {
    return [];
  }
  first() {
    var _ref;
    return _atMaybeArray(_ref = this.makeItems()).call(_ref, -1);
  }
}
new Base().first();