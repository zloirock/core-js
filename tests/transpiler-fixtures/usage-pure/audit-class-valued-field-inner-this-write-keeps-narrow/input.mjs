// a CLASS-valued field initializer rebinds `this` inside its body: the inner class's method
// writes target the INNER instance, so they must not widen the OUTER owner's field narrow
class C {
  items = [1, 2, 3];
  make = class Inner { poison() { this.items = "s"; } };
}
export const viaInnerMethod = new C().items.at(0);

// the inner class's heritage clause evaluates with the OUTER `this`, so a buried write
// there DOES widen the owner field to generic dispatch
class H {
  codes = [1, 2, 3];
  make = class Inner extends (this.codes = "s", Object) { };
}
export const viaHeritage = new H().codes.includes(2);

// an inner computed member key also evaluates with the OUTER `this` - the write widens
// (a multi-type probe: a type-specific dispatcher here would be a wrong-Maybe on the
// string arm the buried write introduces)
class K {
  parts = [1, 2, 3];
  make = class Inner { [(this.parts = "s", "k")]() { } };
}
export const viaComputedKey = new K().parts.includes(2);

// a STATIC class-valued field: the inner method `this` is the inner class, not the outer
// one - the static field narrow survives
class S {
  static rows = [1, 2, 3];
  static make = class Inner { poison() { this.rows = "s"; } };
}
export const viaStatic = S.rows.at(1);

// a STATIC class-valued field whose inner heritage clause writes through the OUTER `this`
// (the class object): the static field narrow widens - the cross of the two rules above
class T {
  static cells = [1, 2, 3];
  static make = class Inner extends (this.cells = "s", Object) { };
}
export const viaStaticHeritage = T.cells.at(2);
