import _at from "@core-js/pure/actual/instance/at";
// external compound write `c.box += "x"` on an instance field is operator-coerced -
// runtime result depends on both operands, can't be type-precise. dispatch must widen
// from array-narrow to generic
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
const c = new C();
c.box += "x";
c.first();