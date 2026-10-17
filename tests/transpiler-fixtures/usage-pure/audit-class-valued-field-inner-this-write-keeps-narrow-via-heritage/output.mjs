import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// the inner class's heritage clause evaluates with the OUTER `this`, so a buried write
// there DOES widen the owner field to generic dispatch
class H {
  codes = [1, 2, 3];
  make = class Inner extends (this.codes = "s", Object) {};
}
export const viaHeritage = _includes(_ref = new H().codes).call(_ref, 2);