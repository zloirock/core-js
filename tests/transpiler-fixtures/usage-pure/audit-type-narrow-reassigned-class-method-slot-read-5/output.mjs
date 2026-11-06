import _at from "@core-js/pure/actual/instance/at";
// a SUBCLASS writes the inherited slot through its own `this`, which the base body never mentions
class Base {
  rows() {
    return [9, 10];
  }
  read() {
    var _ref;
    return _at(_ref = this.rows()).call(_ref, 0);
  }
}
class Derived extends Base {
  poison() {
    this.rows = () => "text";
  }
}
export const values = [new Derived().read()];