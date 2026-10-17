import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a stranger of the SAME name calls after the dead write - the bound must not follow it
class Holder {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
function strangerCallsLater() {
  class Holder {
    ping() {
      return 1;
    }
  }
  new Holder().ping();
}
strangerCallsLater();