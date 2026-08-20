import _at from "@core-js/pure/actual/instance/at";
// a static block writes a static field via `this` - inside a static block `this` is the
// class itself, so `this.items = ...` mutates the static field. the static-member scanner
// must walk StaticBlock paths; the instance scanner excludes static members and misses it.
// without temporal flow on static, init and this write fold, the union collapses to generic
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