// external compound write `c.box += "x"` on an instance field is operator-coerced -
// runtime result depends on both operands, can't be type-precise. dispatch must widen
// from array-narrow to generic
class C {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
const c = new C();
c.box += "x";
c.first();
