import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
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

// the inner class's heritage clause evaluates with the OUTER `this`, so a buried write
// there DOES widen the owner field to generic dispatch
class H {
  codes = [1, 2, 3];
  make = class Inner extends (this.codes = "s", Object) {};
}
export const viaHeritage = _includes(_ref2 = new H().codes).call(_ref2, 2);

// an inner computed member key also evaluates with the OUTER `this` - the write widens
// (a multi-type probe: a type-specific dispatcher here would be a wrong-Maybe on the
// string arm the buried write introduces)
class K {
  parts = [1, 2, 3];
  make = class Inner {
    [(this.parts = "s", "k")]() {}
  };
}
export const viaComputedKey = _includes(_ref3 = new K().parts).call(_ref3, 2);

// a STATIC class-valued field: the inner method `this` is the inner class, not the outer
// one - the static field narrow survives
class S {
  static rows = [1, 2, 3];
  static make = class Inner {
    poison() {
      this.rows = "s";
    }
  };
}
export const viaStatic = _atMaybeArray(_ref4 = S.rows).call(_ref4, 1);

// a STATIC class-valued field whose inner heritage clause writes through the OUTER `this`
// (the class object): the static field narrow widens - the cross of the two rules above
class T {
  static cells = [1, 2, 3];
  static make = class Inner extends (this.cells = "s", Object) {};
}
export const viaStaticHeritage = _at(_ref5 = T.cells).call(_ref5, 2);