import _at from "@core-js/pure/actual/instance/at";
// static block writes to a static field via `this`. `this` in static block is the class
// itself, so `this.items = ...` mutates the static field. static-pipeline scanner walks
// StaticBlock paths via `staticOwnerMethodFns`. instance-pipeline scanner (which excludes
// static members) would have missed this. without temporal flow on static, both init and
// the static-block write are folded; commonType collapses, narrow falls to generic
class C {
  static items = [1, 2, 3];
  static {
    this.items = "stringified";
  }
  static getFirst() {
    var _ref;
    return _at(_ref = C.items).call(_ref, 0);
  }
}
C.getFirst();