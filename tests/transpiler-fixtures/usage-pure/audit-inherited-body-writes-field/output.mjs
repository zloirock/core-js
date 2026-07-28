import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an inherited method runs with the SUBCLASS instance as `this`, so a base-class write lands on the
// slot the subclass declared - the write scan walks descendants and has to walk ancestors too. a base
// this module cannot read as a class (an import, a factory result) owns bodies nobody scanned at all.
// a BUILT-IN base is neither: its prototype belongs to the engine and writes no user-declared field
import Foreign from "foreign";
class Base {
  touch() {
    this.rows = "text";
  }
}
class WrittenByBase extends Base {
  rows = [1, 2];
  read() {
    var _ref;
    return _at(_ref = this.rows).call(_ref, 0);
  }
}
new WrittenByBase().touch();
class BuiltInBase extends Array {
  cells = [1, 2];
  read() {
    var _ref2;
    return _atMaybeArray(_ref2 = this.cells).call(_ref2, 0);
  }
}
new BuiltInBase().read();
class ForeignBase extends Foreign {
  slots = [1, 2];
  read() {
    var _ref3;
    return _includes(_ref3 = this.slots).call(_ref3, 1);
  }
}
new ForeignBase().inherited();