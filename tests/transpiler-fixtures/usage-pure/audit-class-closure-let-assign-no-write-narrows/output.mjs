import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `let c; c = new C(); c.m()` - assignment-init binding tracked in closure (no writes
// through `c`), narrow fires for instance method. previously the assignment-bound shape
// hit isLeakPosition=true and bailed the closure entirely
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
let c;
c = new C();
c.getFirst();