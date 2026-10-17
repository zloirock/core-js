// a CLASS-valued field initializer rebinds `this` inside its body: the inner class's method
// writes target the INNER instance, so they must not widen the OUTER owner's field narrow
class C {
  items = [1, 2, 3];
  make = class Inner { poison() { this.items = "s"; } };
}
export const viaInnerMethod = new C().items.at(0);
