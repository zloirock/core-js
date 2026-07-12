import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// decorators of a CLASS-valued field initializer evaluate in the enclosing scope with the
// OUTER `this` - exactly like heritage and computed keys - so a buried write inside a
// MEMBER decorator widens the owner field to generic dispatch
class C {
  items = [1, 2, 3];
  make = class Inner { @(this.items = "s") m() { } };
}
export const viaMemberDecorator = _at(_ref = new C().items).call(_ref, 0);

// a CLASS-level decorator on the inner class widens the same way
class D {
  codes = [1, 2, 3];
  make = @(this.codes = "s") class Inner { };
}
export const viaClassDecorator = _includes(_ref2 = new D().codes).call(_ref2, 2);

// the inner class buried in an ARROW-valued field: its decorator still runs with the
// captured outer `this` when the arrow executes - the same widen applies mid-scan
class E {
  parts = [1, 2, 3];
  build = () => class Inner { @(this.parts = "s") m() { } };
}
export const viaArrowBuried = _at(_ref3 = new E().parts).call(_ref3, 1);

// negative: a decorator with NO outer-this write leaves the field narrow intact
class F {
  keep = [1, 2, 3];
  make = class Inner { @(String) m() { } };
}
export const viaNoWrite = _includesMaybeArray(_ref4 = new F().keep).call(_ref4, 3);