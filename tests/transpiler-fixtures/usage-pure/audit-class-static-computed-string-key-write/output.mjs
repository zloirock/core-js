import _at from "@core-js/pure/actual/instance/at";
// computed-key write `C['box'] = "x"` is semantically identical to `C.box = "x"`
// - dispatch must widen to generic exactly the same way
class C {
  static box = [1, 2, 3];
  static first() {
    var _ref;
    return _at(_ref = C.box).call(_ref, 0);
  }
}
C['box'] = "x";
C.first();