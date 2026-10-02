import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A closed class getter yields a known constructor whose prototype has its instance family.
// The getter remains one live receiver read, including in a nested pattern.
class Box {
  static get C() {
    effect();
    return Array;
  }
}
use(_atMaybeArray(Box.C.prototype));
const includes = _includesMaybeArray(Box.C.prototype);
use(includes);