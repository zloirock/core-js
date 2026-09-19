import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// boundary: a method call inside a STATIC field initializer runs at class-eval (straight-
// line), unlike an instance field initializer which runs at new-time. so a later external write to
// the captured field does NOT reach this call - it stays narrowed to the array init (`_atMaybeArray`),
// the inverse of the instance-field case which widens to generic
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
class D {
  static f = c.getFirst();
}
c.items = "string";