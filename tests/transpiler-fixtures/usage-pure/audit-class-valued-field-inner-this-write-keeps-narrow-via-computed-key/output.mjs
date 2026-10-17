import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// an inner computed member key also evaluates with the OUTER `this` - the write widens
// (a multi-type probe: a type-specific dispatcher here would be a wrong-Maybe on the
// string arm the buried write introduces)
class K {
  parts = [1, 2, 3];
  make = class Inner {
    [(this.parts = "s", "k")]() {}
  };
}
export const viaComputedKey = _includes(_ref = new K().parts).call(_ref, 2);