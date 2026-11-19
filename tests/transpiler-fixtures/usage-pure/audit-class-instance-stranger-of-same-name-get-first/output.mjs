import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Same-named classes in different scopes have distinct instances. Writes through one class must not widen the fields of the other
// class.
class Holder {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
new Holder().getFirst();