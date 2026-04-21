import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
class C {
  m() {
    try {} catch (_ref) {
      let at = _at(_ref);
      return at(0);
    }
  }
  static s() {
    try {} catch (_ref2) {
      let flat = _flatMaybeArray(_ref2);
      return flat(1);
    }
  }
}