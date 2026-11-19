import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// the stranger's instance is BOUND, so the write travels through its binding
class Holder {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
function strangerBoundInstanceWrite() {
  class Holder {}
  const s = new Holder();
  s.items = "string";
}
strangerBoundInstanceWrite();