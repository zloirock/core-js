import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
// a class opens the same channel on both surfaces: in an INSTANCE member `this` is the instance, in
// a STATIC one it is the constructor, and handing either out puts the slots it carries where no
// scan keyed on the class binding can see the writes
class Instance {
  rows = [1, 2];
  leak() {
    sink(this);
  }
  read() {
    var _ref;
    return _at(_ref = this.rows).call(_ref, 0);
  }
}
new Instance().leak();
class Static {
  static cells = [1, 2];
  static leak() {
    sink(this);
  }
}
Static.leak();
export const seen = _includes(_ref2 = Static.cells).call(_ref2, 1);