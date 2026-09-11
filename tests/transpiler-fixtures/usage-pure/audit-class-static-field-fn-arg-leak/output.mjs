import _at from "@core-js/pure/actual/instance/at";
// class binding leaked through user function arg `leak(C)` opens an unmonitored mutation
// channel - external `arg.items = "x"` write isn't visible to the static-field flow scan
// (we don't see through the function boundary). closure must bail to null so the field
// fold widens to generic dispatch instead of preserving the init-derived array narrow,
// which would emit unsafe `_atMaybeArray` on a runtime-string value
class C {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _at(_ref = C.items).call(_ref, 0);
  }
}
function leak(arg) {
  arg.items = "x";
}
leak(C);
C.getFirst();