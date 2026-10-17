import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a CLASS-valued field initializer rebinds `this` inside its body: the inner class's method
// writes target the INNER instance, so they must not widen the OUTER owner's field narrow
class C {
  items = [1, 2, 3];
  make = class Inner {
    poison() {
      this.items = "s";
    }
  };
}
export const viaInnerMethod = _atMaybeArray(_ref = new C().items).call(_ref, 0);